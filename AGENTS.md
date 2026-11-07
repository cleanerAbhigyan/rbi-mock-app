# Development Agent Instructions — rbi-mock-app

This is an independent repository. Do **not** restructure it into a monorepo or create a nested Git repository. The sibling `../question-predictor` has its own GitHub remote and roadmap.

**Active development branch: `feat/phase-0-foundation` — maintain PR #1 until reviewed for a deliberate merge. Do not create more branches.**

Before coding:

1. Read `README.md` and `docs/PROJECT_CONTEXT.md`, and any existing roadmap and development log.
2. Inspect `git status -sb`, `git remote -v`, and `git branch --show-current`; integrate upstream changes safely (`git pull --ff-only` where appropriate). Do not overwrite uncommitted changes.
3. Follow the requested scope and avoid implementing the future predictor.
4. Create `docs/prompts/YYYY-MM-DD-short-task.md` for a sanitized copy of the prompt, excluding secrets and sensitive information.

For each substantive implementation:

1. Maintain clear tests and run available lint, types, unit tests, and build. Report what actually ran.
2. Update the current documentation (`README.md`, `docs/PROJECT_CONTEXT.md`, `docs/ROADMAP.md`, `docs/DEVELOPMENT_LOG.md`) to match _actual_ code, not intended features.
3. Commit code, tests, prompt record and docs together, then push to this repository's existing remote if authenticated. Never force push. If push fails, keep the local commit and report the precise problem.
4. Report changed files, tests, branch, commit SHA, push result and next phase. Do not claim GitHub sync without a successful push.

Product rules:

- Exam UI is personal practice, not official RBI/IBPS software. Do not imply affiliation.
- Treat 2027 exam pattern as unverified until an official notice.
- Strict exam mode must distinguish draft choices from saved responses; don't show correct answers before final submission.
- Only validated/source-attributed PYQs appear as actual PYQs. No fabricated or model-generated questions can be labeled PYQs. Synthetic developer test fixtures must remain clearly separate.
- The predictor remains in an independent repository, with a future versioned export/import data contract.
- Never commit secrets, personal mock histories, or copyrighted source papers without redistribution permission.

Notion stores product requirements and study progress, GitHub stores implementation truth, ChatGPT coordinates live reviews. They do not synchronize automatically; propose/update Notion status only from verified changes via authorized workflow.

Phase 0 conventions:

- Use Node 24 LTS (`.nvmrc`), npm and the committed lockfile. Run `npm ci` for a clean install.
- Run `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm test`, and `npm run build` before committing substantive changes.
- Question-bank consumers use `QuestionRepository`; never import `src/data/fixtures` into application modules. Keep admission validation strict and atomic.
- Preserve Phase 0 boundaries in `docs/DATA_CONTRACT.md`; expand schema versions explicitly when adding descriptive questions or import formats.
- **Current branch policy (user instruction 2026-11-07):** Reuse the existing `feat/phase-0-foundation` branch for ALL upcoming development phases; do not create a new branch or a new PR for each phase. Push successive implementations to the same branch so that existing PR #1 stays updated. Do not automatically merge it to `main`. Review/merge only after the user agrees that a stable, tested milestone is ready. Once merged, ask before changing the agreed branch workflow. If the local checkout is on `main`, switch to the existing remote feature branch safely without overwriting changes.
- Code, tests, sanitized prompt history and current docs belong in the same implementation commit, followed by a verified push.
