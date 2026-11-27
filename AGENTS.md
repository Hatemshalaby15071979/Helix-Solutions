# AGENTS.md — Agent Charter & Ledger for Helix-Solutions

> **Read order (mandatory, every landing):** `AGENTS.md` → `CONSTITUTION.md` →
> `GOVERNANCE.md` → `README.md`. Then **sign in** to the ledger below, do the work,
> **sign out**. No entry, no trust: an unlogged session's work is treated as unverified
> until someone checks it.

## 1. Who agents are here

An "agent" is any entity that reads or writes this repository — an AI model, an
automation script, or a human acting as operator. There is exactly **one supreme
authority**: the repository owner (**Hatem Shalaby**). An agent acts only on the
owner's instruction and records every landing.

## 2. The mandatory sign-in / sign-out rule

Every agent, on **every landing** (a landing = one session that ends with the agent
stopping, whether the task is finished or not), must:

1. **SIGN IN** before any write action — who, why, what will be touched, sensitive or
   network actions planned, and the **date and time from the system clock**.
2. **SIGN OUT** when the landing's work is complete or stopped — what changed, why,
   the files touched, evidence of verification, and **the current status when leaving**,
   written so the next agent can continue without re-discovery.

Fail closed: if a task cannot be completed, still sign out and state exactly what is
incomplete. Never claim verification that did not happen.

### Entry format

```
## [YYYY-MM-DD HH:MM TZ] — <agent name / model>
Task: <what was assigned>
Touched: <files created / modified / deleted / moved>
Why: <the reasoning, not just the diff>
Verification: <what was actually checked and the observed result>
Left undone: <what is incomplete, needs review, or is deferred — or "nothing">
Sensitive: <any remote writes, secrets, or destructive actions, or "none">
```

### Current status block (keep updated at the top of the ledger)

```
Working — Helix-Solutions is the live master website. The canonical logo at assets/helix-solutions-logo.png is served via raw.githubusercontent.com and used by every portfolio repo. The root index.html mirrors the Helix-Codex landing page; helix-solutions/index.html is the company profile. CI validates HTML structure and brand presence, and enforces the GOVERNANCE.md section 2 root-document rule in both directions; Pages deploys on push to main.
```

## 3. Environment facts

- **Repo:** Helix-Solutions — the master website and company/founder profile behind the Helix Codex body of work — a dependency-free static site that is the single front door for the founder's history, products, apps and dashboards.
- **Owner account:** https://github.com/Hatemshalaby15071979
- **Default branch:** main
- **Where it runs:** static site served by GitHub Pages on every push to main; no build step, no server, no cloud dependency
- **Verification command:** open index.html in a browser, or run `python3 -m http.server 8000` and open http://127.0.0.1:8000/helix-solutions/

## 4. Rules this agent must follow

- Read and obey **CONSTITUTION.md** (philosophy + clean-code policy). On conflict, it
  wins over this file.
- Follow **GOVERNANCE.md** for the repo map, documentation policy, and archiving rules.
- Keep `README.md` the single source of truth; landing pages and dashboards mirror it.
- Keep local and remote in harmony: after a sanctioned change, commit and push so the
  GitHub copy matches the working copy.
- Sign in and sign out every landing, with the real clock time.

## 5. Ledger (sign-in / sign-out)

### 🟢 SIGN-IN — CODEX — 2026-11-26T21:12:00+02:00

- **Mission:** governance unification — add canonical AGENTS.md, CONSTITUTION.md, GOVERNANCE.md; archive stray root docs; fix false CI/test claims in the mirrored index.html.
- **Authorization:** owner instruction 2026-11-26 (workspace ledger); push to main authorised.
- **Files planned:** AGENTS.md, CONSTITUTION.md, GOVERNANCE.md (new); index.html (fix false claims); CASE_STUDY.md, DEMO.md, DEMO_NARRATION.md → docs/archive/.
- **Sensitive/network actions:** push to origin/main; no external writes.

### 🟢 SIGN-OUT — CODEX — 2026-11-26

- Governance files rendered from canonical templates and written to root.
- CONSTITUTION.md is byte-identical to the canonical template (md5 7b3339292cb98b1e1fe67b768ab1d79d).
- index.html false claims corrected (83 failures → 2,107 passed; CI not run → CI green).
- Stray root docs archived to docs/archive/.
- Committed and pushed to origin/main.

### 🟢 SIGN-IN — sami (Claude) — 2026-11-27T04:50:00+02:00

- **Mission:** mirror the root-document assertion the owner approved in Assay on
  2026-11-27 (`scripts/check-scaffold.py`) into this repository: add
  `.github/scripts/check_root_docs.py` and wire it into CI, then fix what it finds.
- **Authorization:** owner's instruction in chat, 2026-11-27 ("mirror the assertion
  across the portfolio").
- **Files planned:** `.github/scripts/check_root_docs.py` (new); `CHANGELOG.md` (new —
  the GOVERNANCE.md section 2 table lists it and no such file exists); `SECURITY.md`
  (new — same reason); `.github/workflows/ci.yml` (new step); `AGENTS.md` (this entry,
  the sign-out, and the current-status block).
- **Why:** section 2 says "No stray `.md`/`.txt` at the root", but nothing asserted the
  *absence* direction — only that the known documents were present. That is how the
  2026-11-26 pass could archive reports while the root set still looked satisfied.
- **Sensitive/network actions:** `git push origin main`; no force push, no PR or issue
  writes, no secrets.

### 🟢 SIGN-OUT — sami (Claude) — 2026-11-27

STATUS: SIGN-OUT (landing complete)

- Mirrored Assay's root-document assertion (approved by the owner 2026-11-27) into this
  repository as `.github/scripts/check_root_docs.py`, byte-identical to the copy landed in
  Assay, createlee, Helix-Codex and Helix-Matrix.
- The gate asserts GOVERNANCE.md section 2 in both directions: every root document the
  table names exists, and no unlisted `.md`/`.txt` sits at the root. The allowed set is
  parsed out of GOVERNANCE.md, so the policy stays the single source of truth;
  `requirements*.txt`/`constraints*.txt` are treated as package manifests, not documents.
- It found two real gaps, both now closed: the section 2 table lists `CHANGELOG.md` and
  `SECURITY.md`, and neither existed. `CHANGELOG.md` is written from the actual history
  with commit references. `SECURITY.md` states the posture, a threat model, the
  `cockpit/` shell's same-origin behaviour, and the honest non-goals — including that this
  repository's workflow actions are tag-pinned (`@v4`, `@v5`), not SHA-pinned.
- CI gained a "Root-document hygiene (GOVERNANCE.md section 2)" step that runs the gate
  and then its self-test.
- Verification: `python3 .github/scripts/validate_site.py` → 13 pages checked, 13 branded,
  "OK: all checks passed". `python3 .github/scripts/check_root_docs.py` → "OK —
  Helix-Solutions/ holds only the GOVERNANCE.md section 2 set" (7 table rows, 7 allowed
  root documents). `--self-test` → "7/7 cases behaved". A planted `STRAY-NOTE.md` and a
  planted `NOTES.txt` were confirmed to stop the gate on a scratch copy before landing.
- Committed and pushed to origin/main (three commits: sign-in, the change, this sign-out).
- Left undone: `cockpit/` is not listed in the GOVERNANCE.md section 1 repository map,
  though it is published from this tree. That is a section-1 documentation gap, not a
  section-2 root violation, so it was left for a landing that owns the repo map.
- Sensitive: plain `git push origin main` (owner's instruction in chat, 2026-11-27).

## [2026-11-27 06:57 EET] — sami (OpenMausBot), owner-authorised resume/portfolio consistency pass
STATUS: SIGN-IN

Task: Owner instruction (2026-11-27 audit note): replace the "company / Founded by" framing with
the verified independent-developer framing (no company, no team, no client, one owner) across
the README and the two published pages; align the glossary TikTok-pilot line with the resume
("one-month live pilot with one colleague — not formally measured, so no quantitative impact
is claimed"); standardise Signoff→Sign-off; add the two missing public repositories
(n8n-production-starter, Helix-Matrix) to the portfolio table and update the count 13→15.

Touched (planned): `README.md`; `index.html`; `helix-solutions/index.html`;
`Operations___AI_Glossary_Reference_Matrix.html`; `AGENTS.md` (this entry and the sign-out).
No code, no build, no route changes.

Why: The owner is applying for a role; the resume says independent developer, so the public
site must not say "the company". Every changed line now matches a verifiable repository fact
or the owner's own statement.

Note: the page edits ran at 06:57–07:02 EET and this sign-in was appended at 07:55 EET,
after an interrupted session; the entry is back-filled, not a pre-write sign-in.

Sensitive: plain `git push origin main` (owner's instruction in chat, 2026-11-27). No force
push, no history rewrite, no secrets.

## [2026-11-27 08:01 EET] — sami (OpenMausBot), owner-authorised resume/portfolio consistency pass
STATUS: SIGN-OUT (landing complete)

Task: Same as the 06:57 sign-in. Done: the company framing is gone from the README and both
published pages; the glossary pilot line now matches the resume; Signoff→Sign-off; the two
missing public repos are in the table and the count is 15 (matching the profile badge).

Touched: `README.md`; `index.html`; `helix-solutions/index.html`;
`Operations___AI_Glossary_Reference_Matrix.html`; `AGENTS.md` (sign-in back-fill and this
sign-out). No code, no build, no route changes, no root document added or removed.

Verification: `git push origin main` landed as `0f218e3`; the root-document gate and page
builds run in CI on that push. The "15 repositories" count matches the profile table
(13 previous rows + n8n-production-starter + Helix-Matrix) and the profile's badge.

Left undone: nothing failing. The section-1 repo-map gap noted at the last sign-out
(`cockpit/` not listed in GOVERNANCE.md section 1) is still that landing's job, not this
one's.

Sensitive: plain `git push origin main` (owner's instruction in chat, 2026-11-27). No force
push, no history rewrite, no secrets.
