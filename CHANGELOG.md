# Changelog

All notable changes to the Helix Solutions master website are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

The site is deployed continuously from `main`: there are no version tags, and a change
is live on GitHub Pages once its run in the Pages workflow is green. Entries are grouped
by the date the change landed, with the commit that carries it.

## 2026-11-27

### Added

- `.github/scripts/check_root_docs.py` — the root-document hygiene gate from
  GOVERNANCE.md section 2, checked in both directions (the documents the section 2 table
  names are present, and no unlisted `.md`/`.txt` sits at the root). Wired into CI with a
  self-test that proves the gate fails closed.
- `SECURITY.md` — posture, threat model, non-goals and the private reporting route.

### Fixed

- `CHANGELOG.md` itself: the GOVERNANCE.md section 2 table lists it and no such file
  existed.

## 2026-11-26

### Changed

- Unified governance set (`40f3125`): added `AGENTS.md`, `CONSTITUTION.md` and
  `GOVERNANCE.md`; `CASE_STUDY.md`, `DEMO.md` and `DEMO_NARRATION.md` moved to
  `docs/archive/`.
- Corrected unverified test figures in the mirrored pages: 1,990 passed / 83 failed was
  replaced with the repository's actual 2,107 passed / 0 deselected (`f99decb`).

## 2026-11-22

### Changed

- Brand mark settled on the white Helix Solutions logo for every team repository
  (`084e328`), after the geometric Helix Codex mark and the earlier gold marks
  (`a9b80c8`, `a9aa36d`, `688a53c`, `a994e8d`, `3cd8fbe`, `bb87fbf`).
- Both founder films got inline looping GIF previews in `README.md`, linking to the full
  release assets (`e4d9245`).

### Added

- The master website launched: the root landing page, the company and founder profile at
  `helix-solutions/index.html`, and the interactive operations and AI glossary
  (`94bcba5`).
