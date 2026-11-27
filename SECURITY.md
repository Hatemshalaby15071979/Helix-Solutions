# Helix Solutions — Security

## The security posture in one line

**The site is static.** It is plain HTML, CSS and JavaScript published to GitHub Pages:
there is no server, no build step, no database and no user account, so there is nothing
to log into and no data of yours held anywhere.

## Threat model (summary)

| Threat | Reality here |
|---|---|
| Exfiltration of visitor data | The site collects nothing and has no analytics, cookies or tracking. Nothing is posted anywhere by a page in this repository. |
| Server-side compromise | There is no server-side code to compromise. Pages serves static files; `helix-api` and any other service belong to sibling repositories. |
| Secrets in the tree | None are committed: no keys, tokens or credentials are read, stored or sent by any page here. CI runs with `contents: read`. |
| Supply chain — third-party scripts | Two pages load pinned third-party libraries: `chart.js@4.5.1` from `cdn.jsdelivr.net` and `lucide@1.43.0` from `unpkg.com`, both in `Operations___AI_Glossary_Reference_Matrix.html`. `helix-solutions/index.html` also loads Google Fonts. These hosts can see the visitor's IP address. Versions are pinned to exact releases. |
| Broken or injected asset references | CI (`validate_site.py`) fails the build on an unbalanced `<div>`, a page missing the canonical brand, or a local `assets/...` reference that does not resolve. |
| Content drift from the portfolio | `README.md` is the single source of truth for what this site is; the `docs-sync` markers keep the mirrored pages honest about CI and test results. |

## The `cockpit/` shell

`cockpit/` holds the day-OS shell, which calls **same-origin** `/api/...` endpoints on the
machine it is opened from and stores its UI preferences (theme, motion, intensity, a
timer, a day note) in the browser's `localStorage` only. Published on GitHub Pages those
`/api` calls have no server behind them and fail closed — the shell runs only when the
matching local service is running on loopback. Nothing from `localStorage` is transmitted
anywhere.

## Non-goals (honest)

- This repository is **not** a security boundary for the sibling products. It links to
  them; it does not authenticate or sandbox them.
- The Pages deployment is a public, unauthenticated website by design. Anything placed in
  this tree is public.
- Actions in this repository's workflows are referenced by tag (`@v4`, `@v5`), not by
  commit SHA as the sibling repositories do. That is a known difference, recorded rather
  than glossed over.

## Reporting Security Issues

Please do **not** open a public issue for a security problem.

1. Open the **Security** tab of this repository.
2. Choose **Report a vulnerability** (GitHub Security Advisories).
3. Describe the issue, the page or workflow affected, and how to reproduce it.

The report is visible only to the maintainers, and you get a reply in the advisory thread
once it has been triaged.

## Supported versions

`main` is the only supported line; the site deploys from it continuously and older commits
are not maintained.
