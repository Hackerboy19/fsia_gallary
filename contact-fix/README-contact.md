# Contact form fix

Two separate problems were found and fixed.

## 1. The page was returning HTTP 500

`/contact.php` returned 500 on every request — even a plain GET, with no form
submitted. The page rendered most of the way and then stopped dead: no footer,
no `</body>`, no `</html>`.

The cause is the second-to-last line of the old file:

```php
<?php include('socialmediaprofile.php'); ?>
<?php include 'footer1806.php'; ?>
```

`socialmediaprofile.php` fatals on its own — requesting it directly returns
**HTTP 500 with zero bytes**. It killed the script, so `footer1806.php` never
ran. (`footer1806.php` itself is fine: it returns 200 and 15,948 bytes.)

The include is now guarded, so a failure there is logged instead of taking the
whole page down. **`socialmediaprofile.php` still needs fixing separately** —
send me that file and I'll sort it out.

## 2. Mail was never arriving

Not a code bug. It is a mail authentication problem, and the DNS says so:

```
fsia.in  MX    -> aspmx.l.google.com, alt1/alt2.aspmx.l.google.com, ...
fsia.in  TXT   -> v=spf1 include:_spf.google.com ~all
_dmarc   TXT   -> v=DMARC1; p=quarantine; adkim=s; aspf=s
```

`care@fsia.in` is a Google Workspace mailbox, and only Google's servers are
authorised to send as `@fsia.in`. The old code used PHP `mail()`, which sends
from the Plesk web server:

- that server is not in the SPF record -> **SPF fails**
- it does not DKIM-sign for fsia.in -> **DKIM fails**
- DMARC is `p=quarantine` with strict alignment -> **Google quarantines it**

Meanwhile `mail()` still returned `true`, because the local MTA accepted the
message. So the form reported success while Google silently binned it.

The fix sends through Google itself over authenticated SMTP, so SPF and DKIM
pass and DMARC aligns. See `mail-config.sample.php` for the app password steps.

## Files

| File | What it is |
| --- | --- |
| `contact.php` | Replaces the existing one |
| `fsia-mailer.php` | New. SMTP sender + logging helpers. No Composer or PHPMailer needed |
| `mail-config.sample.php` | Copy to `mail-config.php` and fill in the app password |

Upload all three to the same folder as the current `contact.php`.

## What else changed in contact.php

- **Thank-you panel.** On success the form is replaced by a confirmation panel
  with the sender's name, a tick, expected reply time, the phone number, and a
  "Send another message" button. The page scrolls it into view.
- **Post/Redirect/Get.** The old form posted to itself and left the POST in
  history, so a refresh sent the enquiry again. It now redirects after handling,
  and the message is carried once in the session.
- **Header-injection fix.** `$subject` was built from `$fname`, and `Reply-To`
  from `$email`, with no CR/LF stripping. `strip_tags` does not remove newlines,
  so a crafted name could inject extra mail headers such as `Bcc:`. All header
  values now go through `fsia_header_safe()`.
- **Email validation.** The old code only sanitised. An invalid address now gets
  a clear message instead of a silent send failure.
- **Every enquiry is logged** to `contact-submissions.log` before sending is
  attempted, so nothing is lost to a mail problem. Failures also land in
  `contact-mail-errors.log`.
- **The visitor is never told to resend.** Since the enquiry is on record, even
  a mail failure shows a thank-you rather than an error.
- `mysqli_fetch_assoc()` is no longer called on a failed query, which is a fatal
  in PHP 8.

## Protect the logs

The two log files sit next to `contact.php` and hold enquiry details, so they
should not be publicly readable. Add this to `.htaccess`:

```apache
<FilesMatch "\.log$">
  Require all denied
</FilesMatch>
```

Better still, move them outside the document root — change `__DIR__` in the
`fsia_log_*` calls in `contact.php` to that path.
