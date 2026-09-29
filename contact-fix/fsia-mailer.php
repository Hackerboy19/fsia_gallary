<?php
/**
 * Minimal SMTP sender for the FSIA contact form.
 *
 * Deliberately dependency-free: no Composer, no PHPMailer to install. It speaks
 * just enough SMTP to authenticate over STARTTLS and hand over one message.
 *
 * Every function here returns a result array rather than a bare bool, because
 * the old code could not tell "the MTA accepted it" from "it reached the
 * inbox" — that ambiguity is exactly why failures went unnoticed.
 */

/** Strip CR/LF so a form value can never inject extra mail headers. */
function fsia_header_safe($value)
{
    return trim(str_replace(["\r", "\n", "%0a", "%0d", "%0A", "%0D"], '', (string) $value));
}

/** Append one line to a log file, creating it if needed. Never throws. */
function fsia_log_line($file, $line)
{
    try {
        $fh = @fopen($file, 'ab');
        if (!$fh) {
            return false;
        }
        @flock($fh, LOCK_EX);
        @fwrite($fh, $line . PHP_EOL);
        @flock($fh, LOCK_UN);
        @fclose($fh);
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

/**
 * Record a submission before any sending is attempted, so an enquiry is never
 * lost to a mail problem. This is the safety net the form did not have.
 */
function fsia_log_submission($dir, array $data, $status)
{
    $row = [
        'time'   => date('Y-m-d H:i:s'),
        'status' => $status,
        'ip'     => $_SERVER['REMOTE_ADDR'] ?? '',
        'name'   => $data['fname'] ?? '',
        'email'  => $data['email'] ?? '',
        'mobile' => $data['mobile'] ?? '',
        'message' => preg_replace('/\s+/', ' ', (string) ($data['comment'] ?? '')),
    ];
    return fsia_log_line(
        rtrim($dir, '/') . '/contact-submissions.log',
        json_encode($row, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );
}

/** Read one SMTP reply (handles multi-line 250-XXX continuations). */
function fsia_smtp_read($fp)
{
    $out = '';
    while (($line = fgets($fp, 515)) !== false) {
        $out .= $line;
        // Last line of a reply has a space in the 4th position, not a hyphen.
        if (strlen($line) < 4 || $line[3] !== '-') {
            break;
        }
    }
    return $out;
}

/** Send a command and check the reply starts with one of $expect. */
function fsia_smtp_cmd($fp, $cmd, array $expect, &$err)
{
    if ($cmd !== null) {
        fwrite($fp, $cmd . "\r\n");
    }
    $reply = fsia_smtp_read($fp);
    $code  = substr(ltrim($reply), 0, 3);
    if (!in_array($code, $expect, true)) {
        // Never echo the command back: it may carry the base64 password.
        $err = 'SMTP expected ' . implode('/', $expect) . ', got: ' . trim($reply);
        return false;
    }
    return true;
}

/**
 * Send one plain-text message over authenticated SMTP.
 *
 * @return array{ok:bool, error:string, transport:string}
 */
function fsia_smtp_send(array $cfg, $subject, $body, $replyTo = '')
{
    $err = '';
    $fail = function ($msg) use (&$err) {
        return ['ok' => false, 'error' => $msg, 'transport' => 'smtp'];
    };

    $timeout = (int) ($cfg['timeout'] ?? 20);
    $fp = @stream_socket_client(
        'tcp://' . $cfg['host'] . ':' . (int) $cfg['port'],
        $errno, $errstr, $timeout,
        STREAM_CLIENT_CONNECT
    );
    if (!$fp) {
        // Commonly port 587 blocked outbound by the host's firewall.
        return $fail('Cannot reach ' . $cfg['host'] . ':' . $cfg['port'] . ' — ' . $errstr . ' (' . $errno . ')');
    }
    stream_set_timeout($fp, $timeout);

    $host = $_SERVER['SERVER_NAME'] ?? 'fsia.in';

    if (!fsia_smtp_cmd($fp, null, ['220'], $err)) { fclose($fp); return $fail($err); }
    if (!fsia_smtp_cmd($fp, 'EHLO ' . $host, ['250'], $err)) { fclose($fp); return $fail($err); }
    if (!fsia_smtp_cmd($fp, 'STARTTLS', ['220'], $err)) { fclose($fp); return $fail($err); }

    if (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        fclose($fp);
        return $fail('TLS handshake failed');
    }

    // EHLO again: the server advertises different capabilities once encrypted.
    if (!fsia_smtp_cmd($fp, 'EHLO ' . $host, ['250'], $err)) { fclose($fp); return $fail($err); }
    if (!fsia_smtp_cmd($fp, 'AUTH LOGIN', ['334'], $err)) { fclose($fp); return $fail($err); }
    if (!fsia_smtp_cmd($fp, base64_encode($cfg['username']), ['334'], $err)) { fclose($fp); return $fail($err); }
    if (!fsia_smtp_cmd($fp, base64_encode(str_replace(' ', '', $cfg['password'])), ['235'], $err)) {
        fclose($fp);
        return $fail('Login rejected. Use a Google App Password, not the mailbox password. (' . $err . ')');
    }

    $from = fsia_header_safe($cfg['from']);
    if (!fsia_smtp_cmd($fp, 'MAIL FROM:<' . $from . '>', ['250'], $err)) { fclose($fp); return $fail($err); }

    $recipients = (array) $cfg['to'];
    $accepted = 0;
    foreach ($recipients as $rcpt) {
        $rcpt = fsia_header_safe($rcpt);
        if (fsia_smtp_cmd($fp, 'RCPT TO:<' . $rcpt . '>', ['250', '251'], $err)) {
            $accepted++;
        }
    }
    if ($accepted === 0) { fclose($fp); return $fail('No recipient accepted. ' . $err); }

    if (!fsia_smtp_cmd($fp, 'DATA', ['354'], $err)) { fclose($fp); return $fail($err); }

    $headers = [
        'Date: ' . date('r'),
        'From: ' . fsia_header_safe($cfg['from_name'] ?? 'FSIA') . ' <' . $from . '>',
        'To: ' . implode(', ', array_map('fsia_header_safe', $recipients)),
        'Subject: ' . fsia_header_safe($subject),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@fsia.in>',
    ];
    if ($replyTo !== '') {
        $headers[] = 'Reply-To: ' . fsia_header_safe($replyTo);
    }

    // Dot-stuffing: a line that is just "." would otherwise end the message.
    $safeBody = preg_replace('/^\./m', '..', str_replace(["\r\n", "\r"], "\n", $body));
    $safeBody = str_replace("\n", "\r\n", $safeBody);

    fwrite($fp, implode("\r\n", $headers) . "\r\n\r\n" . $safeBody . "\r\n.\r\n");
    if (!fsia_smtp_cmd($fp, null, ['250'], $err)) { fclose($fp); return $fail('Server refused the message: ' . $err); }

    fwrite($fp, "QUIT\r\n");
    fclose($fp);

    return ['ok' => true, 'error' => '', 'transport' => 'smtp'];
}

/**
 * Try SMTP, then fall back to mail().
 *
 * The fallback's result is deliberately NOT reported as success. fsia.in sends
 * as Google (MX on Google, SPF include:_spf.google.com, DMARC p=quarantine with
 * strict alignment), so a message posted from the Plesk host fails SPF and DKIM
 * and is quarantined — while mail() still returns true because the local MTA
 * accepted it. Treating that true as delivery is what hid the original fault:
 * the form said "sent" for weeks while nothing arrived. It is still attempted,
 * in case the host is ever configured to relay properly, but only SMTP counts
 * as delivered.
 */
function fsia_send_contact_mail($cfg, $subject, $body, $replyTo, $logDir)
{
    $errLog = rtrim($logDir, '/') . '/contact-mail-errors.log';

    $smtpConfigured = is_array($cfg) && !empty($cfg['enabled']) && !empty($cfg['password'])
        && strpos($cfg['password'], 'PASTE-') === false;

    if ($smtpConfigured) {
        $res = fsia_smtp_send($cfg, $subject, $body, $replyTo);
        if ($res['ok']) {
            return $res;
        }
        fsia_log_line($errLog, date('Y-m-d H:i:s') . ' SMTP FAILED: ' . $res['error']);
    } else {
        fsia_log_line($errLog, date('Y-m-d H:i:s')
            . ' SMTP NOT CONFIGURED - create mail-config.php with a Google App Password.'
            . ' Falling back to mail(), which Google quarantines for this domain.');
    }

    $to = is_array($cfg) && !empty($cfg['to']) ? implode(',', (array) $cfg['to']) : 'care@fsia.in';
    $from = is_array($cfg) && !empty($cfg['from']) ? $cfg['from'] : 'care@fsia.in';

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/plain; charset=UTF-8\r\n";
    $headers .= 'From: ' . fsia_header_safe($from) . "\r\n";
    if ($replyTo !== '') {
        $headers .= 'Reply-To: ' . fsia_header_safe($replyTo) . "\r\n";
    }
    $headers .= 'X-Mailer: PHP/' . phpversion();

    // -f sets the envelope sender; without it the web server user is used and
    // the message fails SPF even harder.
    $ok = @mail($to, fsia_header_safe($subject), $body, $headers, '-f ' . fsia_header_safe($from));

    fsia_log_line($errLog, date('Y-m-d H:i:s') . ' mail() fallback returned '
        . ($ok ? 'true (accepted locally; expect quarantine)' : 'false'));

    // Never report the fallback as delivered — see the note above.
    return [
        'ok'        => false,
        'error'     => $smtpConfigured
            ? 'SMTP failed; mail() fallback is not treated as delivery'
            : 'SMTP not configured; mail() fallback is not treated as delivery',
        'transport' => 'mail()',
    ];
}
