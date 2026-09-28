<?php
// 404 page. Deliberately standalone — no includes, so it can never itself
// error out and turn a 404 into a 500 (which is exactly what was happening).
http_response_code(404);
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,follow">
<title>Page Not Found — Forever Star India</title>
<style>
  :root{--paper:#FAF9F5;--ink:#0C1322;--gold:#B8860B;--line:#EADBAC;--muted:#526077}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       padding:24px;background:var(--paper);color:var(--ink);
       font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
       line-height:1.6;-webkit-font-smoothing:antialiased}
  .card{max-width:560px;width:100%;text-align:center;background:#fff;
        border:1px solid var(--line);padding:48px 32px;box-shadow:0 1px 2px rgba(12,19,34,.05)}
  .code{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin:0 0 12px}
  h1{margin:0 0 12px;font-size:clamp(28px,6vw,40px);line-height:1.1;letter-spacing:-.02em}
  p{margin:0 0 28px;color:var(--muted);font-size:15px}
  .actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  a.btn{display:inline-block;padding:14px 26px;font-size:12px;font-weight:700;
        letter-spacing:.12em;text-transform:uppercase;text-decoration:none;
        border:1px solid rgba(212,175,55,.5);transition:background-color .2s,color .2s}
  .primary{background:var(--ink);color:#EADBAC}
  .primary:hover{background:#1A253E;color:#fff}
  .secondary{background:#fff;color:var(--ink)}
  .secondary:hover{border-color:var(--gold);color:var(--gold)}
</style>
</head>
<body>
  <main class="card">
    <p class="code">Error 404</p>
    <h1>Page not found</h1>
    <p>Ye page exist nahi karta ya hata diya gaya hai. Neeche se homepage par wapas jaayein.</p>
    <div class="actions">
      <a class="btn primary" href="https://www.fsia.in/">Go to homepage</a>
      <a class="btn secondary" href="https://www.fsia.in/quickapply">Apply now</a>
    </div>
  </main>
</body>
</html>
