# Project Context — Exam Simulator

_Phase 0 implementation record: 2026-11-06 (America/Los_Angeles). Earlier planning
recorded the separate-repository decision with a 2026-11-07 date; that decision is
preserved below. Only the delivered foundation described here is implemented._

## Project

Build a personal RBI Grade B (DR–General) CBT-style mock examination application with Phase I first and Phase II later. No RBI/IBPS affiliation.

## Ownership and repository boundaries

- Working folder: `~/projects/rbi-app/rbi-mock-app`
- Source repository: `cleanerAbhigyan/rbi-mock-app`
- Future producer (separate repo): `cleanerAbhigyan/question-predictor`
- No monorepo, common workspace package, direct runtime coupling, or premature model integration.

## Requirements and source-of-truth order

1. Notion's **Exam Experience App** describes intended product behavior and official-source caveats.
2. This GitHub repository records what is actually implemented.
3. ChatGPT reads both when planning future work; prior chat summaries are snapshots, not live code state.

## Current implementation

- Standalone React/TypeScript/Vite application with Tailwind CSS, React Router,
  Zustand, Zod, Vitest/Testing Library, ESLint and Prettier; npm lockfile, Node 24 LTS.
- Routes `/` (dashboard), `/question-bank` (catalog), and a recoverable not-found screen.
- All three future exam choices are disabled and labeled not implemented.
- Empty verified-PYQ catalog and count **0**; no papers were imported from Notion.
- Persistent visible disclaimer and unverified 2027 pattern notice; no 2027 rules.
- Objective question schema `1.0`, source/verification/approval fields, scored
  eligibility checks and stricter PYQ checks. Local loader rejects invalid batches
  and duplicate IDs, and returns defensive copies of validated records.
- Two original synthetic developer fixtures are used only in tests. A synthetic
  metadata candidate in schema tests exercises PYQ admission without asserting
  historical authenticity; it never enters the application catalog.
- ExamProfile, ExamSection, ExamAttempt, DraftResponse, SavedResponse,
  QuestionStatus, ReviewFlag and ExamResult are type contracts only.
- CI checks lint/types/format/tests/build on push and pull request, with read-only
  repository permissions and no deployment.

## Current structure

`src/app` composes routes; `components/layout` owns navigation and the independence
notice; `components/ui` owns the profile notice; `features/exam` renders the
dashboard; `features/questions` renders the catalog and defines QuestionRepository.
`data/question-bank` supplies the empty JSON catalog through validation;
`data/fixtures` is test-only. `schemas`, `stores`, `types`, `styles` and `main.tsx`
cover validation, in-memory read state, future contracts, appearance and startup.
`tests` holds UI and data tests. `.github/workflows/ci.yml` runs checks. `docs`
contains the architecture, data contract, roadmap, development log and sanitized
prompt. Unused results/lib directories have not been created.

## Not implemented / next milestone

Phase 1: build and test a Phase I synthetic demo experience with explicit
draft-vs-saved behavior and all five palette statuses, then source-backed timing,
navigation locks, submission and scoring. Add Playwright when those flows exist.
No timer, exam interactions, scoring, attempt persistence, import UI, offline
installation, descriptive editor, analytics, backend or deployment exists yet.
Real scored PYQs still require reviewed source evidence and redistribution rights.

## Important decisions and verification

- Validation cannot prove historical authenticity: human provenance/answer-key
  review is required before granting verified/approved metadata.
- TypeScript/Zod share a single runtime contract. Structural validity does not imply
  scored eligibility; review-stage null keys/scoring remain outside scored banks.
- No draft choices are stored in `savedResponses`. Palette status will be derived
  from visited state, committed response and review flag in Phase 1.
- No credentials or personal histories are needed for Phase 0.
- Node 24 LTS is selected and verified; the host's default Node 20 was not used for
  final checks. A temporary runtime was installed outside the repository.
- A temporary `minimatch ^11.0.1` npm override patches a development-tool advisory;
  remove it once upstream ESLint/typescript-eslint ranges include a patched version.
- Local rendered tests, lint, types, formatting, build, server startup and HTTP
  checks are recorded in DEVELOPMENT_LOG. The browser access host was unavailable;
  actual browser visual/responsive QA remains outstanding.

## References read for Phase 0

- [GitHub implementation](https://github.com/cleanerAbhigyan/rbi-mock-app)
- [Notion product specification](https://app.notion.com/p/410504b1d5b68152b201dc8f784e3468)
- [Notion RBI project](https://app.notion.com/p/3ff504b1d5b680eeb770c3395de0fdde)
- [Notion PYQ analysis](https://app.notion.com/p/410504b1d5b68125a29fc8d2317e66a0)

All three Notion references were available and read. They describe intended
behavior and research folders, not an imported corpus. No Notion pages or trackers
were modified. [ARCHITECTURE](ARCHITECTURE.md), [DATA_CONTRACT](DATA_CONTRACT.md),
[ROADMAP](ROADMAP.md) and [DEVELOPMENT_LOG](DEVELOPMENT_LOG.md) detail implementation.

## Deferred work

Phase II, attempt analytics, source-document extraction, Notion result export, and any generated-question import. The prediction service will later publish a **versioned validated question export** containing stable IDs, source type, answer-key evidence, model/run IDs where applicable, and human approval status. Never treat generated practice as historical PYQs.

## Sync protocol

At each implementation milestone: `git status` → pull safely → archive sanitized prompt in `docs/prompts/` → implement/tests → update README, PROJECT_CONTEXT, ROADMAP, DEVELOPMENT_LOG → commit → push → report SHA and test results. Coordinate any factual status updates into Notion only after implementation evidence is available and authorized.

Never expose secrets, private attempt records or non-redistributable papers in this public repository.


## Active branch and merge policy — 2026-11-07

- User-approved workflow: keep working on the existing `feat/phase-0-foundation` branch; **do not create new branches** for upcoming phases.
- Continue pushing reviewed code, tests, prompt archives and documentation to that branch and update existing [PR #1](https://github.com/cleanerAbhigyan/rbi-mock-app/pull/1).
- Hold off merging into `main` until a coherent, tested milestone is demonstrated and the user agrees; CI success alone does not mean the candidate exam experience is complete.
- Phase 0 code is present in the PR; the timed exam engine, completed mock attempts, real PYQ imports, and predictor integration are not yet implemented.
- GitHub CI was confirmed successful for Phase 0 head `839882907fc87b62f465fea73e44aed4a2a48d95` before this note. New commits require their own CI verification.
