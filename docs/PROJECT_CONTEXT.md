# Project Context — Exam Simulator

_Updated 2026-11-07 (America/Los_Angeles): Phase 0 foundation and Phase 1A
untimed, unscored candidate interaction demo are implemented. Phase 1B remains planned._

## Project

Build a personal RBI Grade B (DR–General) CBT-style mock examination application with Phase I first and Phase II later. No RBI/IBPS affiliation.

## Ownership and repository boundaries

- Working folder: `~/projects/rbi-app/rbi-mock-app`
- Source repository: `cleanerAbhigyan/rbi-mock-app`
- Active branch: `feat/phase-0-foundation`; reuse existing PR #1 for all milestones.
  No new branches/PRs or automatic merge into main; merge needs explicit user approval.
- Future producer (separate repo): `cleanerAbhigyan/question-predictor`
- No monorepo, common workspace package, direct runtime coupling, or premature model integration.

## Requirements and source-of-truth order

1. Notion's **Exam Experience App** describes intended product behavior and official-source caveats.
2. This GitHub repository records what is actually implemented.
3. ChatGPT reads both when planning future work; prior chat summaries are snapshots, not live code state.

## Current implementation

- Standalone React/TypeScript/Vite application with Tailwind CSS, React Router,
  Zustand, Zod, Vitest/Testing Library, ESLint and Prettier; npm lockfile, Node 24 LTS.
- Routes `/` (dashboard), `/question-bank` (catalog), `/demo/instructions` and
  guarded `/demo/exam`, plus a recoverable not-found screen.
- The full exam options remain unavailable. A separate **Try Phase I Demo** link
  opens instructions and a required agreement before beginning a fresh session.
- Empty verified-PYQ catalog and count **0**; no papers were imported from Notion.
- Persistent visible disclaimer and unverified 2027 pattern notice; no 2027 rules.
- Objective question schema `1.0`, source/verification/approval fields, scored
  eligibility checks and stricter PYQ checks. Local loader rejects invalid batches
  and duplicate IDs, and returns defensive copies of validated records.
- Two original synthetic developer fixtures are used only in tests. A synthetic
  metadata candidate in schema tests exercises PYQ admission without asserting
  historical authenticity; it never enters the application catalog.
- Twelve original runtime demo questions (three per Phase I section) use a
  separate validated provider and explicit synthetic labels. They are unverified
  and pending approval for scoring; neither scored nor PYQ admission was changed.
- Pure immutable demo transitions separate visits, active draft, saved response
  records and independent review flags. All five statuses/counts are derived.
- Palette/section/previous/next navigation discards unsaved edits and restores
  committed responses; save/review/clear and independent review removal work.
  Clear keeps review flags, and save keeps flags until explicitly removed.
- Candidate data excludes keys/explanations and topic hints. Section tabs and radio
  controls support keyboard navigation; the last question never auto-submits.
- Shared profile/response/status types support the interaction demo. Timed
  ExamAttempt and ExamResult remain future contracts. Null section duration
  explicitly represents the custom untimed profile; no official 2027 scheme.
- CI checks lint/types/format/tests/build on push and pull request, with read-only
  repository permissions and no deployment.

## Current structure

`src/app` composes routes; `components/layout` owns navigation and the independence
notice; `components/ui` owns the profile notice; `features/exam` renders the
dashboard, instructions and candidate UI, with pure `demo-session` transitions and
shared presentation components. `features/questions` defines the separate
QuestionRepository and DemoQuestionRepository contracts and catalog UI.
`data/question-bank` supplies the empty JSON catalog through validation;
`data/demo` owns the original runtime examples and validating candidate projection;
`data/fixtures` remains test-only. `stores/demo-session-store.ts` adapts commands
and supplies commit timestamps. `schemas`, `stores`, `types`, `styles` and `main.tsx`
cover validation, in-memory read state, future contracts, appearance and startup.
`tests` holds UI and data tests. `.github/workflows/ci.yml` runs checks. `docs`
contains the architecture, data contract, roadmap, development log and sanitized
prompt. Unused results/lib directories have not been created.

## Not implemented / next milestone

Phase 1B: add profile-driven timing/section locks, refresh-safe deadlines, explicit
submission and objective scoring, with browser end-to-end tests. The current demo
has no countdown, submission, scoring, completed history or persistent attempts.
Reloading clears the session; navigating away discards its draft. Beginning again
clears the old session. No import UI, descriptive editor, analytics, backend,
deployment or Notion synchronization exists. Real scored PYQs still require human
review of provenance, answer keys, scoring and redistribution rights.

## Important decisions and verification

- Validation cannot prove historical authenticity: human provenance/answer-key
  review is required before granting verified/approved metadata.
- TypeScript/Zod share a single runtime contract. Structural validity does not imply
  scored eligibility; review-stage null keys/scoring remain outside scored banks.
- No draft choices are stored in `savedResponses`. Palette status is derived
  from visited state, committed response and review flag in Phase 1A.
- No credentials or personal histories are needed for Phase 0/1A.
- Node 24 LTS is selected and verified; the host's default Node 20 was not used for
  final checks. A temporary runtime was installed outside the repository.
- A temporary `minimatch ^11.0.1` npm override patches a development-tool advisory;
  remove it once upstream ESLint/typescript-eslint ranges include a patched version.
- Local rendered tests, lint, types, formatting, build, server startup and HTTP
  checks are recorded in DEVELOPMENT_LOG. The browser access host was unavailable;
  actual browser visual/responsive QA remains outstanding.

## References read for Phase 0 and rechecked for Phase 1A

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
