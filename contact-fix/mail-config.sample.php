<?php
/**
 * SMTP settings for the contact form.
 *
 * Copy this file to  mail-config.php  (same folder as contact.php) and fill it in.
 * Keep mail-config.php out of git — it holds a password.
 *
 * WHY SMTP AND NOT mail():
 * fsia.in publishes  v=spf1 include:_spf.google.com ~all  and
 * v=DMARC1; p=quarantine; aspf=s; adkim=s. Only Google's servers may send as
 * @fsia.in. PHP mail() sends from the Plesk web server, which fails SPF, is
 * unsigned for DKIM, and is therefore quarantined by Google before it reaches
 * the inbox — while mail() still reports success. Sending through Google with
 * a real login makes SPF and DKIM pass, so the mail lands normally.
 *
 * GETTING THE PASSWORD (Google Workspace):
 *   1. Sign in as care@fsia.in
 *   2. Google Account -> Security -> 2-Step Verification (must be ON)
 *   3. Security -> App passwords -> create one named "FSIA website"
 *   4. Paste the 16-character code below (spaces do not matter)
 * Your normal mailbox password will NOT work here.
 */

return [
    'enabled'  => true,
    'host'     => 'smtp.gmail.com',
    'port'     => 587,          // 587 = STARTTLS
    'username' => 'care@fsia.in',
    'password' => 'PASTE-16-CHAR-APP-PASSWORD-HERE',

    // Must be the same mailbox as username, or an alias it may send as,
    // otherwise Google rewrites it and DMARC alignment breaks.
    'from'      => 'care@fsia.in',
    'from_name' => 'FSIA Website',

    // Where contact queries land. Add more addresses to copy the team in.
    'to'       => ['care@fsia.in'],

    'timeout'  => 20,
];
