# Architecture — Phase 0 and Phase 1A

This is one local-first client application, independent of `question-predictor`.
No server, authentication, cloud storage, deployment or cross-repository runtime
dependency is needed. Catalog and demo-session state are in memory, not durable storage.

## Modules

| Module                   | Responsibility                                                                   |
| ------------------------ | -------------------------------------------------------------------------------- |
| `src/main.tsx`           | React StrictMode startup and BrowserRouter                                       |
| `src/app`                | App composition, dashboard/catalog routes, not-found recovery                    |
| `src/components/layout`  | Header, navigation, skip link, route focus/title, disclaimer                     |
| `src/components/ui`      | Shared official-pattern notice                                                   |
| `src/features/exam`      | Dashboard, instructions, candidate UI, demo profile and pure session transitions |
| `src/features/questions` | Catalog UI and QuestionRepository interface                                      |
| `src/data/question-bank` | Empty real catalog and validating local adapter                                  |
| `src/data/fixtures`      | Original synthetic test-only questions                                           |
| `src/data/demo`          | Separate validated runtime demonstration examples and candidate projection       |
| `src/schemas`            | Zod question, scored eligibility and verified-PYQ contracts                      |
| `src/stores`             | Zustand catalog read model and demo-session command adapter                      |
| `src/types`              | Future profile/attempt/response/result contracts                                 |
| `src/styles`             | Tailwind and responsive light-mode CSS                                           |
| `tests`                  | Rendered application behavior and data admission tests                           |

No empty results/services/lib modules have been introduced. Add those when an
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
before release. There is no end-user import screen or runtime recovery UI yet.
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
The only populated profile is explicitly custom and untimed (null section durations),
with no official timing assumption or 2027 rule.

An unsaved `DraftResponse` is ephemeral and may contain a selected option or null.
A `SavedResponse` records an explicitly committed option, question revision and
save timestamp. Absence from `savedResponses` means no committed answer. An attempt
captures profile/question revision and scoring snapshots for future auditability;
future timed `ExamAttempt` creation, persistence, timers and scoring remain unimplemented.
The current `DemoSession` intentionally has no deadline, submission or result fields.

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
tabs). Rendered-route/keyboard tests pass. Desktop/mobile visual QA could not run
because the browser access host was unavailable; responsive CSS is not evidence of
an actual browser visual test. No timer, submit control or results are displayed.

## Tooling and delivery

Node 24 LTS and npm lock dependencies. Strict TypeScript checks src/tests/Vite
configuration. GitHub Actions installs with `npm ci` and runs lint, types,
formatting, tests and production build on push/PR. Workflow permissions are
`contents: read`; checkout credentials are not persisted. No deployment or secrets.

The dependency override for `minimatch ^11.0.1` addresses
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) in lint tooling.
The final lint/test/build checks validate the override against this project's use.
Revisit when upstream package ranges accept the patched major.

The separate predictor may eventually publish a versioned JSON package for human
review and import. The current application neither calls it nor shares code with
it. Notion holds intended requirements and study progress; GitHub holds verified
implementation. Neither source automatically synchronizes with the other.
