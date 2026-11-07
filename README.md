# RBI Grade B Mock Exam Simulator

Independent, personal-practice computer-based examination simulator for RBI Grade B (DR–General). **Not affiliated with RBI or IBPS.**

## Project layout and relationship

- **This repository:** `rbi-mock-app` — application UI, exam engine, question-bank validation, attempts and analytics.
- **Separate future project:** [question-predictor](https://github.com/cleanerAbhigyan/question-predictor) — PYQ pattern analysis, backtesting and original practice-question generation.
- **Local workspace:** `~/projects/rbi-app/rbi-mock-app`, alongside independent sibling `~/projects/rbi-app/question-predictor`.
- These are **two independent Git repositories**, not a monorepo; no cross-repository runtime dependency is needed now.

## Local development

Use **Node.js 24 LTS** (see `.nvmrc`) and npm. The committed lockfile is the
dependency source of truth.

```sh
nvm install
nvm use
npm ci
npm run dev
```

Open the Local URL printed by Vite (normally http://127.0.0.1:5173).
No environment variables, accounts, database, or backend are required.

| Command                | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Local Vite development server                      |
| `npm run lint`         | ESLint with zero warnings allowed                  |
| `npm run typecheck`    | Strict TypeScript checks, including tests/config   |
| `npm test`             | Run Vitest and React Testing Library tests once    |
| `npm run test:watch`   | Watch tests during development                     |
| `npm run build`        | Type check and create production output in `dist/` |
| `npm run preview`      | Serve a production build locally                   |
| `npm run format:check` | Check Prettier formatting                          |
| `npm run format`       | Apply Prettier formatting                          |
| `npm run test:e2e`     | Playwright desktop/mobile Chromium journeys        |
| `npm run test:e2e:ui`  | Playwright interactive test runner                 |

## Implemented — Phase 1B timed practice

Choose **Try Timed Practice** on the dashboard. The new flow is
`/demo/timed/instructions` → `/demo/timed/exam` → `/demo/timed/results`.
The existing untimed demo below remains available.

- **CUSTOM TIMED PRACTICE — NOT OFFICIAL RBI EXAM PATTERN**: the same 12 original
  demo questions, three per section; General Awareness → English Language →
  Quantitative Aptitude → Reasoning Ability. Each custom section lasts **60 seconds**
  (four minutes total). Correct = **+1**, incorrect = **−0.25**, unanswered = **0**.
  These are example settings, not an official RBI scheme or confirmed 2027 rules.
- The clock starts on acknowledgment and Begin Timed Mock. Absolute section
  deadlines are calculated once. Expired sections lock; future sections cannot be
  entered early. Save/Next stays inside the active section until its deadline.
- Refresh and reopening reconcile the original schedule, including multiple missed
  boundaries. Saved answers/flags survive; unsaved drafts are discarded. Only one
  latest timed attempt is stored in this browser, not a full history.
- Submit Exam opens a keyboard-accessible final confirmation. Cancel continues the
  clock; confirmation freezes answers. Final expiry submits automatically, even
  after returning from an inactive tab or refreshing. Repeated submission is inert.
- Results score **only saved responses**, including answered-and-reviewed ones.
  Totals, attempted/correct/incorrect/unanswered counts, accuracy, section breakdown
  and solutions appear only after submission and remain available after refresh.
- Corrupt/incompatible local data is not scored; an explicit reset is offered.
  Storage failures are reported. Starting another timed mock after completion replaces the
  previous record. An active mock cannot be restarted to reset its clock.

The local-first clock is not a security guarantee against deliberate clock/storage
manipulation. Use one active tab; localStorage is not a transactional multi-tab
service. No official cutoffs, rankings, qualifications or predictions are computed.

Install the browser once, then run the deterministic browser journeys:

```sh
npx playwright install --with-deps chromium
npm run test:e2e
```

Playwright controls the browser clock to test real production durations quickly;
there is no timing-bypass URL or production test profile. Tests cover desktop and
mobile Chromium. Screenshots/traces in ignored `test-results/` are test artifacts.

## Implemented — Phase 1A interaction demo

From the dashboard choose **Try Phase I Demo**, read `/demo/instructions`, accept
the instructions and select **Begin Demo** to enter `/demo/exam`. Opening the exam
URL without an in-memory session redirects to instructions.

- **12 original demonstration questions**: three each in General Awareness,
  English Language, Quantitative Aptitude and Reasoning Ability.
- Visible **DEMO PRACTICE — NOT ACTUAL RBI PYQs** label; custom practice profile,
  untimed and unscored. No assumed official 2027 scheme.
- Keyboard-accessible section tabs, radio answers, previous/next navigation and
  numbered palette with five text/symbol/color statuses and per-section counts.
- Draft selection stays separate from saved response. Navigation discards unsaved
  edits and restores the previous committed answer when you return.
- Save & Next, Mark for Review & Next, Clear Response and independent review-flag
  removal work. Clearing removes draft/saved answers but keeps a review flag;
  saving also keeps the flag until explicitly removed.
- First/last boundaries are safe. Save/review stay on the final question; nothing
  submits. Keys and explanations are excluded from candidate-facing data.

Beginning again resets the session. Reloading loses the session; there is no saved
history, countdown, section locking, submission, scoring or results screen. Runtime
demo data in `src/data/demo` is separate from both the empty verified-PYQ catalog
and the test-only `src/data/fixtures` directory.

## Foundation retained — Phase 0

- Light-mode dashboard, question-bank route, working navigation and unknown-route recovery.
- Clearly disabled Phase I, Phase II and Sectional Practice options.
- Verified-PYQ count derived from the validated local catalog; currently **0**.
- Empty state, independence disclaimer and pending 2027 official-pattern notice.
- Strict versioned Zod question schemas, scored/PYQ admission gates, atomic local
  repository loader, and isolated synthetic test fixtures.
- Shared contracts for profiles, draft/saved responses, five palette statuses and
  review flags; Phase 1B adds a strict versioned timed-attempt contract and results.
- Automated UI/schema/repository tests and GitHub Actions for lint, types, formatting,
  tests and build. No deployment workflow.

React 19 + TypeScript + Vite, Tailwind CSS 4, React Router, Zustand and Zod form the
client stack. Vitest, React Testing Library, ESLint and Prettier support development.
The untimed demo is in memory. Timed practice uses validated localStorage; no cloud
storage or offline installation is implemented. Tailwind utilities are supplemented
by responsive component CSS.

## Architecture

```text
src/
  app/                         App and route composition
  components/{layout,ui}/      Shared shell and exam-profile notice
  features/{exam,questions}/   Untimed/timed UI, pure engines, persistence/scoring, contracts
  data/demo/                   Validated runtime demo provider, separate from PYQs
  data/fixtures/               Synthetic developer content, tests only
  data/question-bank/          Empty catalog and validated local adapter
  schemas/                    Question and persisted timed-attempt Zod contracts
  stores/                     Catalog, untimed session and timed storage/clock adapters
  types/                      Future exam-engine contracts
  styles/                     Foundation and candidate-interface responsive CSS
  main.tsx                    Browser entry point
tests/                        Rendered-route and data-boundary tests
e2e/                          Playwright journeys and screenshot capture
playwright.config.ts          Desktop/mobile Chromium, local test server
.github/workflows/ci.yml       Push/PR checks
docs/                         Architecture, contract, roadmap, log and prompt history
```

`features/results` and `lib` will be introduced when they have implementations;
empty placeholder modules are intentionally absent. The UI reads through
`QuestionRepository`; it does not load developer fixtures. See
[Architecture](docs/ARCHITECTURE.md) and [Data contract](docs/DATA_CONTRACT.md).

## Planned features

Next phases add reviewed real-PYQ intake, official-source profiles, completed-attempt
history, Phase II and analytics. The complete RBI simulator is not finished merely
because the custom Phase I demos work. See the [Roadmap](docs/ROADMAP.md).

**Question policy:** verified, reviewed, source-attributed historical PYQs are the intended real question source. If none are imported, show an empty state. Developer fixtures remain test-only. Original runtime demonstration content has a separate provider and explicit demo labels. Never fabricate or relabel PYQs.

The 2027 RBI examination pattern remains unconfirmed until an official notice; use versioned source-backed exam profiles.

## Development status

Phases 0, 1A and 1B are implemented and tested as custom practice. The complete
official-source simulator is not implemented. Verification evidence and limits are recorded in the
[Development log](docs/DEVELOPMENT_LOG.md). See [Project context](docs/PROJECT_CONTEXT.md),
[Changelog](CHANGELOG.md) and [Agent instructions](AGENTS.md).

## GitHub–Notion–ChatGPT continuity

- **GitHub:** actual committed code and implementation documentation.
- **Notion:** product requirements, source research and study-tracker context.
- **ChatGPT:** coordinates work by reading current Notion and GitHub information when asked.
- Synchronization is a **deliberate per-change workflow**, not automatic real-time three-way mirroring. For every coding task, archive the sanitized prompt, update docs and tests, commit and push; report SHA and blockers. Update Notion from confirmed implementation evidence, not proposals.

Do not commit tokens, private test history, or question papers lacking redistribution rights. This repository is currently public.
