# Architecture — Phase 0

This is one local-first client application, independent of `question-predictor`.
No server, authentication, cloud storage, deployment or cross-repository runtime
dependency is needed. Phase 0 uses in-memory state, not durable attempt storage.

## Modules

| Module                   | Responsibility                                                |
| ------------------------ | ------------------------------------------------------------- |
| `src/main.tsx`           | React StrictMode startup and BrowserRouter                    |
| `src/app`                | App composition, dashboard/catalog routes, not-found recovery |
| `src/components/layout`  | Header, navigation, skip link, route focus/title, disclaimer  |
| `src/components/ui`      | Shared official-pattern notice                                |
| `src/features/exam`      | Foundation dashboard; no engine behavior                      |
| `src/features/questions` | Catalog UI and QuestionRepository interface                   |
| `src/data/question-bank` | Empty real catalog and validating local adapter               |
| `src/data/fixtures`      | Original synthetic test-only questions                        |
| `src/schemas`            | Zod question, scored eligibility and verified-PYQ contracts   |
| `src/stores`             | Zustand in-memory catalog read model                          |
| `src/types`              | Future profile/attempt/response/result contracts              |
| `src/styles`             | Tailwind and responsive light-mode CSS                        |
| `tests`                  | Rendered application behavior and data admission tests        |

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

Correct answers exist in the local question data, but neither dashboard nor catalog
renders them. Phase 1 strict mode must hide answers/explanations until submission.
Local-only client delivery cannot prevent someone inspecting bundled data with
developer tools; it is a personal practice tool.

## Future exam boundary — interfaces only

`types/exam.ts` defines profiles, sections, attempts, draft/saved responses, review
flags, palette status and objective result shapes. Profile source status separates
awaiting-official-notification, verified-reference and custom-practice profiles.
There is no populated exam profile, official timing assumption or 2027 rule.

An unsaved `DraftResponse` is ephemeral and may contain a selected option or null.
A `SavedResponse` records an explicitly committed option, question revision and
save timestamp. Absence from `savedResponses` means no committed answer. An attempt
captures profile/question revision and scoring snapshots for future auditability;
there is no attempt creation, persistence, timer or scoring implementation yet.

| Palette status                   | Future derivation                            |
| -------------------------------- | -------------------------------------------- |
| Not visited                      | Not opened; no saved response or review flag |
| Not answered                     | Opened, no committed response, unmarked      |
| Answered                         | Committed response, unmarked                 |
| Marked for review without answer | Review flag, no committed response           |
| Answered and marked for review   | Review flag and committed response           |

Changing a draft must not change the committed answer or silently save on palette
navigation. Phase 1 must explicitly specify save/clear/review transitions and test
them. Saved answers marked for review remain eligible for evaluation. Status text
and icons must accompany colors. Result contracts are objective-only for now;
descriptive responses will require an explicit schema extension and manual rubric.

## UI and accessibility

Native navigation links, headings/landmarks, a skip link, keyboard focus styles,
route focus/title updates and true disabled exam controls provide the basics.
The desktop two-column layout stacks at narrower widths; the header and cards
wrap on mobile. No performance history or dummy attempts are displayed.
Rendered-route/keyboard tests pass; browser screenshots and mobile visual QA were
unavailable because the browser access host could not be reached.

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
