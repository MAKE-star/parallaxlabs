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
   - `NOTIFY_FROM` — (optional) must be a domain you've verified in Resend,
     e.g. `Parallax Labs <notifications@parallaxlabs.tech>`. Until you verify
     a domain, Resend's sandbox `onboarding@resend.dev` sender also works for testing.
3. Redeploy the site (env vars require a new deploy to take effect).
4. Submit a test entry on `/contact` — you should get the branded email within
   a few seconds. Check the function logs under **Site → Logs → Functions** if not.

## Notes

- This runs *alongside* Netlify's own Forms dashboard, not instead of it —
  every submission still shows up under **Site → Forms → project-request**
  regardless of whether the email sends successfully.
- If `RESEND_API_KEY` isn't set, the function no-ops safely (logs a warning,
  returns 200) rather than failing the form submission.
