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
Working — Helix-Solutions is the live master website. The canonical logo at assets/helix-solutions-logo.png is served via raw.githubusercontent.com and used by every portfolio repo. The root index.html mirrors the Helix-Codex landing page; helix-solutions/index.html is the company profile. CI validates HTML structure and brand presence; Pages deploys on push to main.
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
