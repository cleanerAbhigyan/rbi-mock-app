# Development log

## 2026-11-06 — Phase 0: Project Foundation & Architecture

Date uses America/Los_Angeles. Task:
[sanitized implementation prompt](prompts/2026-11-06-phase-0-foundation.md).

### Starting evidence

- Read AGENTS.md, README.md and PROJECT_CONTEXT.md; no roadmap, log, application or
  package manager previously existed. Starting worktree was clean.
- Existing origin: `https://github.com/cleanerAbhigyan/rbi-mock-app.git`.
- Fetched origin; local/remote main were identical (0 ahead / 0 behind).
  `git pull --ff-only` reported already up to date at `49dc824`.
- Created `feat/phase-0-foundation`; no main merge or history rewriting.
- Read all three supplied Notion pages. The product specification and research
  folders establish intended requirements, not existing question records. No
  Notion pages or study trackers were changed.

### Delivered changes

- Created the React/TypeScript/Vite app, Tailwind styling, React Router dashboard
  and catalog routes, recovery route, responsive shell, skip link/focus styling,
  route title/focus handling, native disabled future exam options and explicit
  official-pattern/affiliation notices.
- Kept the real question catalog empty. Added a strict versioned objective schema,
  separately narrowed scored and verified-PYQ schemas/types, atomic validation,
  duplicate-ID detection, defensive repository snapshots and Zustand read state.
- Added two isolated original synthetic test fixtures. Synthetic metadata used
  within schema tests is explicitly a contract test, never historical evidence.
- Defined future profile/section/attempt/draft/saved/review/palette/result types.
  No exam engine behavior, real PYQ intake or predictor integration was added.
- Added test/lint/type/format/build infrastructure and read-only push/PR CI.
- Preserved existing project boundaries and documented actual implementation,
  future requirements, provenance trust boundaries and verification limitations.

### Changed files

- Application: `index.html`, `src/main.tsx`, `src/app/App.tsx`, `src/app/router.tsx`,
  `src/components/layout/AppLayout.tsx`, `src/components/ui/PatternNotice.tsx`,
  `src/features/exam/Dashboard.tsx`, `src/features/questions/QuestionBankPage.tsx`,
  `src/features/questions/question-repository.ts`, `src/stores/question-bank-store.ts`,
  `src/styles/index.css`.
- Data/contracts: `src/schemas/question.ts`, `src/types/exam.ts`,
  `src/data/question-bank/local-question-repository.ts`,
  `src/data/question-bank/verified-pyqs.json`, `src/data/fixtures/objective-questions.ts`.
- Tests: `tests/setup.ts`, `tests/app.test.tsx`, `tests/question-schema.test.ts`.
- Tooling: `package.json`, `package-lock.json`, `.nvmrc`, `.gitignore`,
  `.prettierrc.json`, `.prettierignore`, `eslint.config.js`, `tsconfig.json`,
  `vite.config.ts`, `.github/workflows/ci.yml`.
- Documentation: `README.md`, `AGENTS.md`, `CHANGELOG.md`, `docs/PROJECT_CONTEXT.md`,
  `docs/ARCHITECTURE.md`, `docs/DATA_CONTRACT.md`, `docs/ROADMAP.md`, this log and
  `docs/prompts/2026-11-06-phase-0-foundation.md`.

### Actual validation

Checks used Node **24.22.2 LTS**, installed temporarily under `/tmp` because the
host default was Node 20.19.2; no runtime binary is committed. npm version: 9.2.0.

| Check                  | Actual outcome                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`               | Passed from final package-lock; 245 packages installed, audit reported 0 vulnerabilities                                                                             |
| `npm run lint`         | Passed with zero warnings                                                                                                                                            |
| `npm run typecheck`    | Passed, including tests and Vite config                                                                                                                              |
| `npm test`             | Passed: 49 tests across 2 files                                                                                                                                      |
| `npm run build`        | Passed: 130 modules; JS 354.31 kB (109.19 kB gzip), CSS 13.01 kB (3.93 kB gzip)                                                                                      |
| `npm run format`       | Applied formatting to source/config/docs                                                                                                                             |
| `npm run format:check` | Passed: all matched files use Prettier code style                                                                                                                    |
| Local launch           | Vite 8.3.6 ready; `http://127.0.0.1:5173/`                                                                                                                           |
| HTTP smoke checks      | `/`, `/question-bank` and transformed `/src/main.tsx` returned successful responses                                                                                  |
| UI tests               | Identity/disclaimers, disabled options, empty count, links/routes, direct route, keyboard activation, focus/title and missing-route recovery passed                  |
| Data tests             | Valid fixtures, malformed records, source preservation, approval/key/scoring gates, fixture exclusion, duplicate IDs, atomic rejection and snapshot isolation passed |
| Fixture isolation      | Production source-import and built-bundle scan passed; fixture IDs/question text absent                                                                              |
| Scoped secret review   | No common token/private-key patterns or environment files found; no papers or histories added                                                                        |
| `git diff --check`     | Passed                                                                                                                                                               |
| Browser visual QA      | Not performed: browser inventory reported “The browser access host is unavailable”                                                                                   |

The local server was stopped after HTTP verification. No Playwright package,
deployment, database or authentication was introduced. DOM tests are evidence for
rendering and interaction behavior, not pixel-level or mobile visual verification.

### Decisions, issues and limits

- Schema validation cannot authenticate a source; humans must review original
  references, keys, scoring and redistribution rights before approval.
- Zero approved PYQs is the expected live state. The UI has no fake test history.
- Source category, verification status, approval status and fixture usage remain
  independent fields; passing structural validation never grants catalog entry.
- Strict scoring schemas narrow key/scoring fields to non-null TypeScript types;
  no scoring function exists yet.
- Added `minimatch ^11.0.1` override after installation reported 10 moderate
  development-dependency findings from the same advisory
  [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
  Updated install and clean install both reported 0 vulnerabilities. Lint and tests
  passed with the override. Revisit when upstream lint dependencies accept it.
- Sandbox made `.git` read-only and blocked network/loopback operations. Explicit
  elevated tool approvals were used for fetch/branch work, dependency installation
  and local-server verification; no repository or filesystem workaround was used.
- Remaining verification limit: browser host unavailable, so desktop/mobile visual
  QA must be done in an accessible browser. No functional implementation blocker
  was found in local automated checks.

### Git delivery

Implementation commit subject: `feat: establish Phase 0 simulator foundation`.
Code, tests, current docs and sanitized prompt are committed together. The exact
commit reference and verified synchronization outcome are appended after commit
creation; no successful push is assumed in this pre-commit record.

Next milestone: implement and test Phase I draft/saved response transitions and
five palette statuses using a clearly labeled synthetic demo bank, then extend to
the rest of the Phase I flow and Playwright coverage.
