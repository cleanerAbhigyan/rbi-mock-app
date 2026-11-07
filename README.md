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
  review flags; timed attempts and results remain future contracts.
- Automated UI/schema/repository tests and GitHub Actions for lint, types, formatting,
  tests and build. No deployment workflow.

React 19 + TypeScript + Vite, Tailwind CSS 4, React Router, Zustand and Zod form the
client stack. Vitest, React Testing Library, ESLint and Prettier support development.
State is in memory; Phase 0 does **not** save personal attempts or implement offline
installation. Tailwind utilities are supplemented by responsive component CSS.

## Architecture

```text
src/
  app/                         App and route composition
  components/{layout,ui}/      Shared shell and exam-profile notice
  features/{exam,questions}/   Demo UI, pure transitions, profiles, repository contracts
  data/demo/                   Validated runtime demo provider, separate from PYQs
  data/fixtures/               Synthetic developer content, tests only
  data/question-bank/          Empty catalog and validated local adapter
  schemas/                    Versioned Zod validation and inferred question types
  stores/                     In-memory catalog and demo-session Zustand stores
  types/                      Future exam-engine contracts
  styles/                     Foundation and candidate-interface responsive CSS
  main.tsx                    Browser entry point
tests/                        Rendered-route and data-boundary tests
.github/workflows/ci.yml       Push/PR checks
docs/                         Architecture, contract, roadmap, log and prompt history
```

`features/results` and `lib` will be introduced when they have implementations;
empty placeholder modules are intentionally absent. The UI reads through
`QuestionRepository`; it does not load developer fixtures. See
[Architecture](docs/ARCHITECTURE.md) and [Data contract](docs/DATA_CONTRACT.md).

## Planned features

Phase 1B will add profile-driven timing, section locks, refresh-safe deadlines,
submission, objective scoring and end-to-end browser coverage. Later phases add
reviewed real-PYQ intake, official-source profiles, persistent history, Phase II
and analytics. Phase 1 as a whole is not complete. See the [Roadmap](docs/ROADMAP.md).

**Question policy:** verified, reviewed, source-attributed historical PYQs are the intended real question source. If none are imported, show an empty state. Developer fixtures remain test-only. Original runtime demonstration content has a separate provider and explicit demo labels. Never fabricate or relabel PYQs.

The 2027 RBI examination pattern remains unconfirmed until an official notice; use versioned source-backed exam profiles.

## Development status

Phase 0 and the Phase 1A interaction demo are implemented and locally checked; the
complete simulator is not implemented. Verification evidence and limits are recorded in the
[Development log](docs/DEVELOPMENT_LOG.md). See [Project context](docs/PROJECT_CONTEXT.md),
[Changelog](CHANGELOG.md) and [Agent instructions](AGENTS.md).

## GitHub–Notion–ChatGPT continuity

- **GitHub:** actual committed code and implementation documentation.
- **Notion:** product requirements, source research and study-tracker context.
- **ChatGPT:** coordinates work by reading current Notion and GitHub information when asked.
- Synchronization is a **deliberate per-change workflow**, not automatic real-time three-way mirroring. For every coding task, archive the sanitized prompt, update docs and tests, commit and push; report SHA and blockers. Update Notion from confirmed implementation evidence, not proposals.

Do not commit tokens, private test history, or question papers lacking redistribution rights. This repository is currently public.
