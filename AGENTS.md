# Development Agent Instructions — rbi-mock-app

This is an independent repository. Do **not** restructure it into a monorepo or create a nested Git repository. The sibling `../question-predictor` has its own GitHub remote and roadmap.

Before coding:
1. Read `README.md` and `docs/PROJECT_CONTEXT.md`, and any existing roadmap and development log.
2. Inspect `git status -sb`, `git remote -v`, and `git branch --show-current`; integrate upstream changes safely (`git pull --ff-only` where appropriate). Do not overwrite uncommitted changes.
3. Follow the requested scope and avoid implementing the future predictor.
4. Create `docs/prompts/YYYY-MM-DD-short-task.md` for a sanitized copy of the prompt, excluding secrets and sensitive information.

For each substantive implementation:
1. Maintain clear tests and run available lint, types, unit tests, and build. Report what actually ran.
2. Update the current documentation (`README.md`, `docs/PROJECT_CONTEXT.md`, `docs/ROADMAP.md`, `docs/DEVELOPMENT_LOG.md`) to match *actual* code, not intended features.
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
