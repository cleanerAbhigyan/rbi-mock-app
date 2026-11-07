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

- Implementation commit: `d51f0b738db559d471808cd0e1b789b03c6b024d`
  (`feat: establish Phase 0 simulator foundation`). Code, tests, current docs and
  sanitized prompt were committed together across 38 changed files.
- Pushed successfully to `origin/feat/phase-0-foundation`; `git ls-remote` verified
  that the remote SHA matched the implementation commit. The worktree was clean.
- Opened [PR #1](https://github.com/cleanerAbhigyan/rbi-mock-app/pull/1) against
  `main`. It is unmerged; no main-branch or Notion update was performed.
- [GitHub CI run 42316563761](https://github.com/cleanerAbhigyan/rbi-mock-app/actions/runs/42316563761)
  completed successfully for the implementation commit: install, lint, types,
  formatting, tests and build all passed on the GitHub runner.
- This follow-up documentation record adds the now-known implementation SHA and
  delivery evidence. Its own commit/push SHA is reported in the final delivery
  message to avoid a self-referential commit identifier.

Next milestone: implement and test Phase I draft/saved response transitions and
five palette statuses using a clearly labeled synthetic demo bank, then extend to
the rest of the Phase I flow and Playwright coverage.

## 2026-11-07 — Phase 1A: Candidate Interface & Answer Management

Prompt: [sanitized full implementation brief](prompts/2026-11-07-phase-1a-candidate-interface.md).
Branch: `feat/phase-0-foundation`; existing PR #1 is reused. No branch or PR was
created and no merge was performed. Starting worktree was clean at `7dc31e5`.
Fetch comparison showed 0 ahead / 0 behind; fast-forward pull was already up to date.
All existing context/architecture/contract/roadmap/log documentation was read, as
were the three current Notion references. No Notion edits were made.

### Delivered behavior

- Dashboard entry **Try Phase I Demo** → `/demo/instructions` → agreement-gated
  Begin Demo → `/demo/exam`. Direct exam visits without a session redirect safely.
- Custom, untimed, unscored profile: 12 original synthetic runtime examples across
  the four Phase I sections, with **DEMO PRACTICE — NOT ACTUAL RBI PYQs** labels.
- Section tabs, radio answers, previous/next, palette navigation, Save & Next,
  Mark for Review & Next, Clear Response and explicit Remove Review Flag work.
- Visits, current draft, saved responses and review flags are independent. Drafts
  never count as answered or silently save. Navigation discards edits and restores
  older committed answers. All five palette states and section counts are derived.
- Saving keeps review flags; clearing removes draft/saved responses while retaining
  a review flag. Removing a flag preserves saved and draft choices.
- Section tabs open the first question in a section. Previous/Next and save/review
  cross section boundaries in profile order; first/last limits are safe. Last-question
  save/review stays there without wrapping or submitting.
- Candidate projections omit keys, explanations and topic hints. Real PYQs remain
  empty, and test fixtures stay isolated. Demo content is unverified/pending and
  fails scored/PYQ admission; no existing question schema rule was weakened.
- Radio/section keyboard interactions, active indicators, textual/symbol statuses,
  visible focus and responsive candidate CSS are implemented.

### Architecture and changed files

- Domain: `src/features/exam/demo-session.ts` holds pure immutable transitions,
  status/count derivation and a separate untimed `DemoSession` shape. The store
  supplies timestamps; presentation does not implement answer-saving rules.
- Data/profile: `src/data/demo/demo-questions.ts`,
  `src/data/demo/local-demo-repository.ts`,
  `src/features/questions/demo-question-repository.ts`,
  `src/features/exam/demo-profile.ts`. The separate demo repository validates entire
  sets, rejects duplicate IDs/missing sections/wrong metadata and returns defensive
  candidate projections. Navigation follows explicit profile section order.
- State: `src/stores/demo-session-store.ts`; no persistence middleware. Begin Demo
  clears prior state. Leaving the candidate route discards only its draft; reload
  clears the session. `src/types/exam.ts` now permits null duration for untimed
  sections without altering future deadline/submission/result contracts.
- Presentation: `src/features/exam/DemoInstructions.tsx`, `DemoExam.tsx`,
  `components/PaletteLegend.tsx`, `components/QuestionEditor.tsx`,
  `components/QuestionPalette.tsx`, `components/SectionTabs.tsx`,
  `components/palette-states.ts`; updated `Dashboard.tsx`, `src/app/router.tsx`,
  `src/components/layout/AppLayout.tsx`, `src/main.tsx`; added `src/styles/demo.css`.
- Tests: `tests/demo-session.test.ts`, `tests/demo-repository.test.ts`,
  `tests/demo-app.test.tsx`. Original Phase 0 tests were preserved unchanged.
- Documentation: README, AGENTS, PROJECT_CONTEXT, ARCHITECTURE, DATA_CONTRACT,
  ROADMAP, CHANGELOG, this log and the full archived prompt. Existing single-branch
  policy was preserved; one runtime-demo boundary rule was added to AGENTS.
- Unchanged: question schema 1.0, verified-PYQ repository/catalog, test fixtures,
  package versions, lockfile and CI workflow. No dependency was added.

### Actual verification

Node 24.22.2 (temporary runtime already present under `/tmp`), npm 9.2.0.

| Check                                     | Outcome                                                                                                                           |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                                  | Passed, 245 packages installed from committed lockfile                                                                            |
| `npm run lint`                            | Passed, zero warnings                                                                                                             |
| `npm run typecheck`                       | Passed after correcting new test typings and command-union narrowing                                                              |
| `npm run format` / `npm run format:check` | Formatting applied; final pre-commit check passed                                                                                 |
| `npm test`                                | Passed: 79 tests in 5 files; 49 retained Phase 0 tests and 30 new domain/provider/UI tests                                        |
| `npm run build`                           | Passed: 143 modules; JS 375.20 kB (115.31 kB gzip), CSS 21.00 kB (5.67 kB gzip)                                                   |
| Local startup                             | Vite 8.3.6 ready at `http://127.0.0.1:5173/`; stopped after checks                                                                |
| HTTP smoke                                | 200 for `/`, `/demo/instructions`, `/demo/exam` entry HTML and transformed DemoExam module; client guard tested separately in RTL |
| Isolation                                 | Production source/bundle scan excludes fixture imports, fixture IDs and fixture question text                                     |
| Scope check                               | `git diff --exit-code` confirmed schema, real bank, fixtures, package and lockfile unchanged                                      |
| Secret/material review                    | Scoped token/private-key/environment-file checks passed; no private attempts or source papers added                               |
| `git diff --check`                        | Passed                                                                                                                            |
| Browser desktop/mobile QA                 | Unavailable: browser inventory returned “The browser access host is unavailable”; no visual test claimed                          |

Tests cover fresh starts/guards/agreement, all sections and questions, keyboard
selection/navigation, unsaved isolation, old-answer restoration, clearing/review
independence, every palette state/count, boundary behavior, hidden keys/explanations,
validation/source separation and provider snapshot isolation. An initial command
union typing issue and two test typing issues were corrected before the passing
checks. No failing tests remain.

### Limits and next milestone

This completes only Phase 1A's interaction demo. There are no timers, section
locks, refresh-safe deadlines, persistence, final submission, scoring, results,
completed history, real-PYQ import, Phase II, generation/predictor integration,
Notion synchronization, auth, backend or deployment. Visual browser QA is still a
verification limitation. Client-bundled source data is inspectable; stripping
keys from candidate projections is not an anti-cheating guarantee.

Phase 1B should begin with profile-driven timing/section-lock transitions and
refresh-safe deadline tests, followed by submission/scoring over committed answers
and browser E2E coverage. Use a custom demo profile until official source rules
are reviewed. Phase 1 as a whole remains incomplete.

### Commit and push evidence

- Implementation commit: `9c30aade2c423f981aa8e73cfde1f806ab8bc4be`
  (`feat: implement Phase 1A exam interaction demo`). Source, tests, documentation
  and archived prompt were committed together across 31 changed files.
- Push to `origin/feat/phase-0-foundation` succeeded. `git ls-remote` verified the
  exact remote SHA above; the worktree was clean after the push.
- Existing [PR #1](https://github.com/cleanerAbhigyan/rbi-mock-app/pull/1) reflected
  that head SHA and remained open/unmerged. Its title/description were updated to
  cover the actual foundation and Phase 1A scope. No new branch/PR was created.
- [GitHub CI run 42364082941](https://github.com/cleanerAbhigyan/rbi-mock-app/actions/runs/42364082941)
  completed successfully: install, lint, typecheck, format check, tests and build
  all passed on the GitHub runner.
- This follow-up documentation commit records the now-known implementation SHA,
  push/PR evidence and CI result. Its own final SHA and verified push are reported
  in the completion message to avoid a self-referential commit ID.
