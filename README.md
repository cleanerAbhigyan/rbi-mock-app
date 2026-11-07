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

## Implemented — Phase 0

- Light-mode dashboard, question-bank route, working navigation and unknown-route recovery.
- Clearly disabled Phase I, Phase II and Sectional Practice options.
- Verified-PYQ count derived from the validated local catalog; currently **0**.
- Empty state, independence disclaimer and pending 2027 official-pattern notice.
- Strict versioned Zod question schemas, scored/PYQ admission gates, atomic local
  repository loader, and isolated synthetic test fixtures.
- Type contracts for future profiles, attempts, draft/saved responses, five palette
  statuses, review flags and results; no exam engine yet.
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
  features/{exam,questions}/   Dashboard and question-bank UI/repository contract
  data/fixtures/               Synthetic developer content, tests only
  data/question-bank/          Empty catalog and validated local adapter
  schemas/                    Versioned Zod validation and inferred question types
  stores/                     In-memory Zustand question-bank read model
  types/                      Future exam-engine contracts
  styles/                     Tailwind entry point and responsive styles
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

Phase 1 will implement the Phase I CBT experience with an explicitly synthetic
demo set: instructions, timer, question palette, distinct draft/saved answers,
marking, submission and post-test review. Later phases add reviewed real-PYQ intake,
source-backed exam profiles, persistence, Phase II and analytics. Playwright E2E
testing arrives with the exam experience. See the [Roadmap](docs/ROADMAP.md).

**Question policy:** verified, reviewed, source-attributed historical PYQs are the intended real question source. If none are imported, show an empty state. Synthetic/original developer fixtures may be used only for clearly labeled demos and automated tests. Never fabricate or relabel PYQs.

The 2027 RBI examination pattern remains unconfirmed until an official notice; use versioned source-backed exam profiles.

## Development status

Phase 0 foundation is implemented and locally checked; the complete simulator is
not implemented. Verification evidence and limits are recorded in the
[Development log](docs/DEVELOPMENT_LOG.md). See [Project context](docs/PROJECT_CONTEXT.md),
[Changelog](CHANGELOG.md) and [Agent instructions](AGENTS.md).

## GitHub–Notion–ChatGPT continuity

- **GitHub:** actual committed code and implementation documentation.
- **Notion:** product requirements, source research and study-tracker context.
- **ChatGPT:** coordinates work by reading current Notion and GitHub information when asked.
- Synchronization is a **deliberate per-change workflow**, not automatic real-time three-way mirroring. For every coding task, archive the sanitized prompt, update docs and tests, commit and push; report SHA and blockers. Update Notion from confirmed implementation evidence, not proposals.

Do not commit tokens, private test history, or question papers lacking redistribution rights. This repository is currently public.
