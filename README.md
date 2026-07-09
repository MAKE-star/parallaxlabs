# submission-created.js

Netlify automatically invokes any function named `submission-created` whenever
a Netlify Form on this site is submitted — no webhook configuration needed.

This function sends a branded HTML email (Parallax Labs purple/dark theme)
via Resend whenever the `project-request` form is submitted.

## Setup

1. Create a free account at https://resend.com and grab an API key.
2. In the Netlify dashboard: **Site configuration → Environment variables**, add:
   - `RESEND_API_KEY` — your Resend API key
   - `NOTIFY_TO` — (optional) defaults to `parallaxlabs.tech@gmail.com`
   - `NOTIFY_FROM` — (optional) leave unset at first. It defaults to Resend's
     sandbox sender (`onboarding@resend.dev`), which works immediately with
     no domain setup. Once you verify a domain in the Resend dashboard, set
     this to e.g. `Parallax Labs <notifications@parallaxlabs.tech>`.
3. Redeploy the site (env vars require a new deploy to take effect).
4. Submit a test entry on `/contact` — you should get the branded email within
   a few seconds. Check the function logs under **Site → Logs → Functions** if not.

## If the email you get looks plain, not branded

That's very likely Netlify's own built-in Forms notification, not this
function. Check **Site → Forms → project-request → Settings and usage →
Form notifications** — if there's an "Email notification" listed there, that's
sending the plain version alongside (or instead of, if this function errored)
the branded one. Remove it if you only want the branded email, or check
**Site → Logs → Functions → submission-created** for the actual error if the
branded one isn't arriving at all (most common cause: `NOTIFY_FROM` pointing
at an unverified domain — see above).

## Notes

- This runs *alongside* Netlify's own Forms dashboard, not instead of it —
  every submission still shows up under **Site → Forms → project-request**
  regardless of whether the email sends successfully.
- If `RESEND_API_KEY` isn't set, the function no-ops safely (logs a warning,
  returns 200) rather than failing the form submission.