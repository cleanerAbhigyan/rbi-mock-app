# Development Agent Instructions — rbi-mock-app

This is an independent repository. Do **not** restructure it into a monorepo or create a nested Git repository. The sibling `../question-predictor` has its own GitHub remote and roadmap.

**Active development branch: `Feature`. PR #1 was merged into `main` on 2026-11-07. Use `Feature` for future development.**

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
- Runtime demo content uses the separate `DemoQuestionRepository` under `src/data/demo` and never enters `listVerifiedPyqs`. Synthetic timed practice may use the separate validated internal demo-key provider without granting scored-catalog or historical approval. Preserve pure draft/saved/review transitions and derive palette status; do not persist duplicate status fields.
- Timed commands must reconcile absolute deadlines before editing, reject locked/stale editors, and preserve final-submission idempotency. Persist only validated versioned attempts without drafts or solutions; incompatible records require explicit recovery. Run `npm run test:e2e` with Chromium when changing timed flows, in addition to fast checks.
- Preserve Phase 0 boundaries in `docs/DATA_CONTRACT.md`; expand schema versions explicitly when adding descriptive questions or import formats.
- **Current branch policy (updated 2026-11-07):** Continue new work on the existing `Feature` branch. The prior PR #1 was merged into `main`; do not reopen or push updates to that merged PR. Do not create additional branches or PRs unless the user explicitly requests one. Never merge into `main` without the user's approval. The previous branch name `feat/phase-0-foundation` is retired; do not push new work there.
- Code, tests, sanitized prompt history and current docs belong in the same implementation commit, followed by a verified push.

## GitHub-first Codex handoff (required for every implementation task)

The user does **not** want to copy completion reports between VS Code and ChatGPT.
GitHub is the handoff channel. After each milestone, Codex must:

1. Create a sanitized, dated report in `docs/reports/YYYY-MM-DD-<milestone>-completion.md`. Reuse an existing file for the same milestone rather than duplicating it. Report actual work, implemented routes/features, files changed, verified question counts, validation commands and outcomes, browser QA evidence/limitations, known blockers, and next proposed work.
2. Update `docs/CODEX_LATEST_REPORT.md` as the **stable entry point**. It must name the latest milestone and completion status, link to the dated report, reference the relevant task prompt and development-log entry, state the current branch `Feature`, and give the confirmed push/CI status with links where known. Never claim green CI until verified. If pending, mark **pending** and link to the run; update after checks finish when feasible.
3. Update `docs/CODEX_NEXT_TASK.md` to **Completed — awaiting next task** only when the task is actually implemented and validated. Do not select the next task autonomously.
4. Commit code, tests, docs, dated report and latest-report pointer together; push to `origin/Feature` and verify the remote commit. A commit cannot reliably contain its own final SHA; link to the current `Feature` branch head or record an earlier implementation commit. Avoid repeated self-referential follow-up commits just to embed their own SHA.
5. If tests, push or verification are blocked, report the truthful partial/pending status in the repository where possible, and mention the blocker in the final local Codex reply. Never invent success or embed secrets, private attempts, non-redistributable papers, or excessive raw logs.

After Codex pushes, the user's only chat message can be **"Review the latest GitHub work"**. ChatGPT will fetch `docs/CODEX_LATEST_REPORT.md`, the linked dated report, current commits, source and CI directly. ChatGPT does **not** monitor GitHub continuously; the user still needs to tell ChatGPT when to review.

The reports supplement—not replace—review of actual committed source, tests, and GitHub Actions. Do not create another branch or PR and do not merge into `main` unless the user explicitly requests it.
