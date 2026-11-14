# Project Context — Exam Simulator

_Updated 2026-11-14 (America/Los_Angeles): Phases 0, 1A, 1B and the Phase 2A
source-review/intake and independent reference-profile foundation are implemented._

## Project

Build a personal RBI Grade B (DR–General) CBT-style mock examination application with Phase I first and Phase II later. No RBI/IBPS affiliation.

## Ownership and repository boundaries

- Working folder: `~/projects/rbi-app/rbi-mock-app`
- Source repository: `cleanerAbhigyan/rbi-mock-app`
- Active development branch: `Feature` (renamed workflow, 2026-11-07).
  PR #1 was merged into `main` at `5b939ee`; future work uses `Feature`.
  No new PR or merge without explicit user approval.
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
  guarded `/demo/exam`, and separate `/demo/timed/{instructions,exam,results}`
  routes, plus a recoverable not-found screen.
- The full exam options remain unavailable. A separate **Try Phase I Demo** link
  opens instructions and a required agreement before beginning a fresh session.
- Empty verified-PYQ catalog and count **0**; no papers were imported from Notion.
- Phase 2A adds strict source/candidate/import/review/provenance contracts, atomic
  normalization/staging, duplicate flags, committed human approval and private
  reviewed-output generation. The public sources, reviews, traces and reference
  profiles all remain empty. Runtime catalog loading requires linked evidence;
  the Node/CI check additionally binds actual content to reviewed fingerprints.
- `/question-bank` shows read-only readiness and operator instructions. No import
  editor, file picker, privileged browser promotion or added exam route exists.
- Independent profile contracts support custom/pending/official-source-verified
  status, source citations for each pattern fact, exact counts/order/timing,
  navigation, validity and marking overrides. Neither custom demo is relabeled or
  wired to this registry. No historical official pattern was cross-checked or added.
- Persistent visible disclaimer and unverified 2027 pattern notice; no 2027 rules.
- Objective question schema `1.0`, source/verification/approval fields, scored
  eligibility checks and stricter PYQ checks. Local loader rejects invalid batches
  and duplicate IDs, and returns defensive copies of validated records.
- Two original synthetic developer fixtures are used only in tests. A synthetic
  metadata candidate in schema tests exercises PYQ admission without asserting
  historical authenticity; it never enters the application catalog.
- Twelve original runtime demo questions (three per Phase I section) use a
  separate validated provider and explicit synthetic labels. They are unverified
  and pending for catalog approval; neither scored nor PYQ admission was changed.
  A separate internal validated-key provider permits scoring synthetic timed practice only.
- Pure immutable demo transitions separate visits, active draft, saved response
  records and independent review flags. All five statuses/counts are derived.
- Palette/section/previous/next navigation discards unsaved edits and restores
  committed responses; save/review/clear and independent review removal work.
  Clear keeps review flags, and save keeps flags until explicitly removed.
- Candidate data excludes keys/explanations and topic hints. Section tabs and radio
  controls support keyboard navigation; the last question never auto-submits.
- Shared profile/response/status types support both demos. A separate strict timed
  contract implements absolute deadlines, sequential section locks and versioned
  local persistence. Null section duration still represents the untimed profile.
- Custom timed profile revision 1: four 60-second sections, +1 correct, −0.25 wrong,
  zero unanswered; no official 2027 rules. Only the current section can be edited.
- Every command reconciles elapsed deadlines first; skipped windows never grant
  extra time. At final expiry the original final deadline stamps submission.
- Saved answers/flags, profile/question snapshots and schedule survive refresh;
  drafts do not. Bad or stale storage is quarantined with explicit reset recovery.
- Manual confirmation and automatic timeout finalize idempotently. Results score
  saved answers only using integer hundredths, and reveal solutions after submission.
  The latest completed record survives refresh; starting another replaces it.
- CI checks lint/types/format/tests/build on push and pull request, with read-only
  repository permissions, desktop/mobile Playwright Chromium journeys and no deployment.
  It now also runs `npm run intake:check` against the public registries.

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
prompt. `features/exam/timed` owns engine, persistence, scoring and timed UI;
`schemas/timed-attempt.ts` defines the strict DTO, and `stores/timed-practice-store.ts`
injects clock/storage/IDs. `e2e` and `playwright.config.ts` exercise real Chromium.
No empty modules or backend services have been created.

Phase 2A adds `schemas/source-intake.ts` and `schemas/exam-profile.ts`,
`features/intake/{pipeline,evidence}.ts`, `features/profiles/{registry,check}.ts`,
empty `data/source-review/*.json` ledgers, `data/exam-profiles/profiles.json`, and
`scripts/intake.ts`. Pipeline/check/CLI modules are Node-only; readiness loads only
public metadata and browser-safe validation. `tests/fixtures/intake.ts` is synthetic
contract-test content only. Private staging is ignored and never bundled.

## Not implemented / next milestone

Phase 2A's foundation is delivered; actual licensed source intake and verified
official reference data remain unimplemented. No next task is selected. Full history/analytics, Phase II,
prediction/import integration, accounts, cloud services, deployment and Notion
synchronization remain deferred. Only one latest timed record is retained.

## Important decisions and verification

- Validation cannot prove historical authenticity: human provenance/answer-key
  review is required before granting verified/approved metadata.
- Imported flags are rejected. The local CLI uses only committed fixed-path
  evidence for promotion, with independent human IDs and exact content/source
  digests. Review artifacts are procedural, not identity/authenticity proof.
- Public source metadata permission and question-content redistribution permission
  are explicit; permission to publish a paper file is a separate boolean. No paper
  files or private extracts are committed, even when metadata can be published.
- TypeScript/Zod share a single runtime contract. Structural validity does not imply
  scored eligibility; review-stage null keys/scoring remain outside scored banks.
- No draft choices are stored in `savedResponses`. Palette status is derived
  from visited state, committed response and review flag in Phase 1A.
- No credentials or cloud services are needed. Timed attempts stay in browser
  storage and must never be committed or exported into the public repo.
- Node 24 LTS is selected and verified; the host's default Node 20 was not used for
  final checks. A temporary runtime was installed outside the repository.
- A temporary `minimatch ^11.0.1` npm override patches a development-tool advisory;
  remove it once upstream ESLint/typescript-eslint ranges include a patched version.
- Actual unit/component/domain/store and Playwright results, lint, types, formatting
  and build evidence are recorded in DEVELOPMENT_LOG. Phase 1B installed Chromium
  and verified desktop/mobile journeys and screenshots; prior browser-host limits
  did not prevent this explicit Playwright workflow.
- The local clock/storage are not security guarantees. Last-observed time is
  monotonic within an attempt, but deliberate manipulation remains possible. Use
  one active tab; storage events are synchronized but writes are not transactional.
- Submitted responses are frozen; repeated submission/ticks do not alter the
  timestamp or create another result record. Accurate scores require matched
  current question revisions and validated internal keys.

## References (product specification rechecked for Phase 2A)

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
