# Parallax Labs — website

A static 4-page site: no build step, no framework, no backend required.

## Structure
```
parallax-labs/
├── index.html          Home
├── about.html           About / team
├── projects.html        Case studies / work
├── contact.html          Project request form
├── 404.html               Branded not-found page
├── netlify.toml            Redirects, security headers, caching
└── assets/
    ├── style.css            Design system (colors, type, components)
    ├── main.js                Nav toggle, parallax hero motion, scroll reveal, form submit
    ├── favicon.svg              Browser tab icon
    └── og-cover.png / .svg       Social share preview image
```

## Deploy (Netlify — recommended, form works with zero config)

**Fastest:** go to app.netlify.com → drag this whole folder onto the dashboard. Done —
your site is live at a `*.netlify.app` URL and the contact form (`data-netlify="true"`
in `contact.html`) starts collecting submissions immediately. Check submissions under
Site settings → Forms.

**CLI:**
```bash
npm install -g netlify-cli
cd parallax-labs
netlify login
netlify deploy --prod
```
Publish directory: `.`

**Git-based (best for ongoing edits):** push this folder to a GitHub repo, then in
Netlify: Add new site → Import an existing project → connect the repo. Leave the
build command empty, publish directory `.` (or wherever these files live in the repo).
Every `git push` auto-redeploys.

## Before going fully live
1. Swap the placeholder email `parallaxlabs.tech@gmail.com` (in the footer of every page
   and on `contact.html`) for a real inbox.
2. Point a real domain at the site: Netlify → Domain management → Add a domain, then
   either hand Netlify your nameservers or add the DNS records it shows you. HTTPS is
   automatic.
3. Submit the contact form once yourself after deploying, and confirm it shows up
   under Site settings → Forms.
4. If you add more pages, give them the same `<link rel="icon">`, `og:*`, and
   `theme-color` meta tags as the existing pages (copy the `<head>` block).

## Editing content
Everything is plain HTML/CSS — no templating. Team, project, and stat copy lives
directly in `about.html` / `projects.html` / `index.html`; the nav and footer are
duplicated across all four pages, so if you add a nav link, add it in all four.
