# Architecture — Phases 0, 1A and 1B

This is one local-first client application, independent of `question-predictor`.
No server, authentication, cloud storage, deployment or cross-repository runtime
dependency is needed. Catalog and untimed-demo state are in memory. The latest timed practice uses validated localStorage.

## Modules

| Module                   | Responsibility                                                                   |
| ------------------------ | -------------------------------------------------------------------------------- |
| `src/main.tsx`           | React StrictMode startup and BrowserRouter                                       |
| `src/app`                | App composition, untimed/timed/catalog routes, recovery guards                   |
| `src/components/layout`  | Header, navigation, skip link, route focus/title, disclaimer                     |
| `src/components/ui`      | Shared official-pattern notice                                                   |
| `src/features/exam`      | Dashboard, instructions, candidate UI, demo profile and pure session transitions |
| `src/features/questions` | Catalog UI and QuestionRepository interface                                      |
| `src/data/question-bank` | Empty real catalog and validating local adapter                                  |
| `src/data/fixtures`      | Original synthetic test-only questions                                           |
| `src/data/demo`          | Separate demo examples, candidate projection and internal key provider           |
| `src/schemas`            | Zod question/catalog gates and strict timed persistence contract                 |
| `src/stores`             | Zustand catalog/demo adapters, timed clock/storage boundary                      |
| `src/types`              | Future profile/attempt/response/result contracts                                 |
| `src/styles`             | Tailwind and responsive light-mode CSS                                           |
| `tests`                  | Rendered application behavior and data admission tests                           |

Results live in the timed feature; no empty services/lib modules have been introduced. Add those when an
implementation needs them.

## Data flow

```text
verified-pyqs.json (untrusted input, currently [])
  → createLocalQuestionRepository(input: unknown)
  → Zod array validation + per-question eligibility + unique catalog IDs
  → QuestionRepository.listVerifiedPyqs() (defensive copy)
  → Zustand read model
  → Dashboard count / QuestionBankPage

developer fixtures → test imports only (no path into the application catalog)

runtime demo examples → objective schema 1.0 + stricter demo metadata/batch checks
  → DemoQuestionRepository.listDemoQuestions() (candidate projection, defensive copy)
  → custom untimed profile → pure DemoSession transitions → Zustand → candidate UI
```

Every record in a load must pass; failures throw rather than silently filtering
invalid entries. An invalid checked-in catalog blocks loading and must be corrected
before release. There is no end-user question import screen or catalog recovery UI yet. Timed
attempt recovery is a separate boundary below.
Catalog validation tests run in CI before build.

## Question boundaries

Structural validity, scored eligibility and verified-PYQ eligibility are separate
contracts. Source category never changes during loading. Reconstructed, original
and generated practice cannot enter the actual-PYQ catalog, even if reviewed.
Fixture usage excludes developer content from every scored catalog. Provenance is
a reviewed claim, not cryptographic proof; Zod cannot establish source authenticity.
See [Data contract](DATA_CONTRACT.md) for exact fields and rules.

Correct answers exist in local development data, but the dashboard, catalog and
candidate screen do not render them. The demo repository omits keys/explanations
from candidate projections. Future strict mode must hide solutions until submission.
Local-only client delivery cannot prevent someone inspecting bundled data with
developer tools; it is a personal practice tool.

## Current demo-session boundary

Routes are `/` (dashboard), `/question-bank`, `/demo/instructions` and `/demo/exam`.
The instructions checkbox gates Begin Demo, which creates a fresh in-memory session,
visits the first question, clears old choices/flags and navigates to the exam.
The exam route redirects to instructions when no session exists. Beginning again
always resets; reload clears state. Leaving the route discards unsaved edits while
the rest of the session remains in memory until reset/reload.

`demo-session.ts` owns immutable, pure `startDemoSession` and
`transitionDemoSession` functions. State holds profile ID, stable active question
ID, visited IDs, a single active `DraftResponse`, committed `SavedResponse` records
and independent review flags. Statuses and counts are derived, never stored.
The Zustand store supplies commit timestamps and forwards commands; React components
render questions and invoke commands without implementing answer-saving rules.

- Selecting updates only the draft. Navigating to another question restores that
  target's committed response and discards edits. Clicking the current palette
  button does not discard its draft.
- Previous/Next and Save/Review cross section boundaries in profile order. Section
  tabs open the selected section's first question and retain all saved/visit/flag
  state by ID. Previous/Next are disabled at overall boundaries; save/review remain
  functional on the last question and stay there, without wrapping or submission.
- Save commits a selected choice then advances. Without a choice, it simply advances.
  Mark for Review commits if selected, sets a review flag, then advances.
- Clear deletes the active draft and saved response, retaining its review flag.
  Remove Review Flag retains both draft and saved response. Save also retains an
  existing flag; only the explicit removal command clears it.

`features/exam/components` separates radio editing/actions, keyboard-operable
section tabs, palette and shared legend. Current-question indicators, symbols,
accessible button names and visible text accompany palette colors. Counts apply
to the active section; the header also shows overall question position.

The 12 demo examples are original development content with unverified/pending
metadata, not approved scored questions or historical sources. The live PYQ bank
and test fixtures remain separate. See [Data contract](DATA_CONTRACT.md).

## Shared and future exam contracts

`types/exam.ts` defines profiles, sections, attempts, draft/saved responses, review
flags, palette status and objective result shapes. Profile source status separates
awaiting-official-notification, verified-reference and custom-practice profiles.
Both populated profiles are custom: the untimed profile uses null durations, and
the separate timed profile uses configured example durations. Neither contains
an official timing assumption or 2027 rule.

An unsaved `DraftResponse` is ephemeral and may contain a selected option or null.
A `SavedResponse` records an explicitly committed option, question revision and
save timestamp. Absence from `savedResponses` means no committed answer. An attempt
captures profile/question revision and scoring snapshots for auditability.
The untimed `DemoSession` intentionally has no deadline, submission or result fields.
Phase 1B uses a separate strict Zod-inferred timed contract rather than changing the
untimed state shape. The older broad ExamAttempt/ExamResult interfaces remain a
future general-purpose contract; the current implementation is the custom timed flow below.

| Palette status                   | Implemented derivation                       |
| -------------------------------- | -------------------------------------------- |
| Not visited                      | Not opened; no saved response or review flag |
| Not answered                     | Opened, no committed response, unmarked      |
| Answered                         | Committed response, unmarked                 |
| Marked for review without answer | Review flag, no committed response           |
| Answered and marked for review   | Review flag and committed response           |

Changing a draft must not change the committed answer or silently save on palette
navigation. Phase 1A implements and tests these save/clear/review transitions.
Saved answers marked for review remain committed for future evaluation. Status text
and icons must accompany colors. Result contracts are objective-only for now;
descriptive responses will require an explicit schema extension and manual rubric.

## UI and accessibility

Native navigation links, headings/landmarks, a skip link, keyboard focus styles,
route focus/title updates and true disabled exam controls provide the basics.
The desktop two-column layout stacks at narrower widths; the header and cards
wrap on mobile. No performance history or dummy attempts are displayed.
Candidate radio groups and section tabs support keyboard use (arrows/Home/End for
tabs). Rendered-route/keyboard tests pass. Phase 1A originally lacked browser-host access. Phase 1B adds Playwright Chromium
verification at desktop and mobile viewports, including actual screenshot inspection.
The untimed demo still has no timer, submission control or results.

## Tooling and delivery

Node 24 LTS and npm lock dependencies. Strict TypeScript checks src/tests/Vite
configuration. GitHub Actions installs with `npm ci` and runs lint, types,
formatting, unit/component tests, production build and Playwright Chromium journeys on push/PR. Workflow permissions are
`contents: read`; checkout credentials are not persisted. No deployment or secrets.

The dependency override for `minimatch ^11.0.1` addresses
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) in lint tooling.
The final lint/test/build checks validate the override against this project's use.
Revisit when upstream package ranges accept the patched major.

The separate predictor may eventually publish a versioned JSON package for human
review and import. The current application neither calls it nor shares code with
it. Notion holds intended requirements and study progress; GitHub holds verified
implementation. Neither source automatically synchronizes with the other.

## Phase 1B timed practice

Routes: `/demo/timed/instructions`, `/demo/timed/exam`, `/demo/timed/results`.
The dashboard has separate untimed and timed entry links. Instructions require
acknowledgment and show the custom 60-second duration for each of four sections,
+1/−0.25 marking and recovery limitations. None are official RBI settings.

`timed/profile.ts` defines a versioned custom profile and candidate projections.
`timed/engine.ts` is pure: the clock is passed in, and each command first reconciles
absolute section windows calculated cumulatively from the original start time.
Windows are half-open `[start, deadline)`: at the exact boundary expiry wins over
saving. Delayed ticks skip elapsed windows without granting fresh time. At final
expiry, submission is stamped with the original final deadline, not wake-up time.
Observed time never moves backwards within a stored attempt. This is still a local
wall clock and cannot provide a security guarantee against deliberate manipulation.

Only the derived current section is editable. Past and future navigation commands
are rejected in the domain, not just disabled visually. Phase 1A transitions are
reused over the active section's question subset, so Save/Next clamps at its last
question. A boundary-crossing command is discarded, and UI commands identify their
editor so stale events cannot edit a newly opened question. Visited/saved/review
state remains keyed by question ID. Drafts are discarded at expiry and route exit.

`schemas/timed-attempt.ts` describes the strict persisted DTO; `timed/persistence.ts`
validates it against the current profile/question revision and content snapshots,
schedule, IDs/options, visited/lock state and save/submission timestamps. Drafts and
solutions are never serialized. Corrupt/unsupported/incompatible records remain
unscored until an explicit reset of this application's one storage key.

`stores/timed-practice-store.ts` injects clock, storage and ID creation, adapts pure
transitions and writes the latest active/completed record. Hydration restores the
editor from committed responses and reconciles all elapsed deadlines before use.
An active mock cannot restart to reset time. Beginning a new mock after completion
explicitly replaces the latest result; this is not an attempt-history system.
Storage failures block new starts or display a warning during an active attempt.
Storage events refresh other mounted timed views, but localStorage is not a
transactional multi-tab service: use one active tab.

`use-timed-lifecycle.ts` requests reconciliation on interval, focus and visibility
changes. Its interval never decrements an authoritative counter. A final submitted
attempt is immutable to all subsequent commands/ticks. The native modal dialog
provides focus containment, Escape cancellation and a final confirmation, while
timing continues. Manual submission discards drafts and freezes committed responses;
a simultaneous final timeout wins. No scoring side effect runs during submission.

`data/demo/demo-scoring-repository.ts` validates original demo keys separately from
candidate projections and from scored/PYQ catalog approval. The pure
`timed/scoring.ts` rejects pre-submit access and mismatched saved IDs/revisions/options.
It uses integer hundredths for at-most-two-decimal weights, scores reviewed saved
answers normally, and treats unsaved/unanswered review as zero. Results are derived
from the single finalized record, so repeated submission cannot duplicate result
records or change timestamps. The result page alone requests keys/solutions after
its submission guard; they never appear in candidate props or state. Client bundles
remain inspectable, as expected for local personal practice.

Playwright runs production profiles with a controlled browser clock rather than a
production bypass. Desktop/mobile Chromium tests cover refresh, section locks,
manual confirmation, multiple missed deadlines, automatic submission and results,
and retain untimed coverage. Unit/store/component tests inject clocks/storage;
UI tests fake Date/intervals while leaving user-event async scheduling real.
