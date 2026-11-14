# Current Codex task

**Status:** Completed — awaiting next task.

**Task:** Phase 2A — PYQ intake, source review and exam-profile foundation.

**Full instructions:** [Phase 2A Codex implementation task](prompts/2026-11-07-phase-2a-pyq-intake-and-profile-foundation.md)

**Implemented and validated:** 2026-11-14. Source-reviewed intake and independent
reference-profile foundation delivered; actual real-PYQ/source/review/official-profile
counts remain 0. See the [completion report](reports/2026-11-07-phase-2a-completion.md),
[latest handoff](CODEX_LATEST_REPORT.md) and [development log](DEVELOPMENT_LOG.md#phase-2a--2026-11-14).
No next task has been selected; do not rerun this milestone.

## How to run

1. Check that this file says **Ready for implementation**. If it says completed, stop; do not rerun a completed milestone.
2. Open the existing `rbi-mock-app` workspace, check the current worktree, and work on `Feature`.
3. Read `AGENTS.md` and the **entire** linked implementation task. Read the other existing project docs and source code as instructed.
4. Implement the linked task exactly as written; do not merely summarize it. Test, document, commit and push to `Feature`. PR #1 is already merged; do not create a new PR or merge without user approval.
5. On completion, change **Status** above to `Completed — awaiting next task`, recording the implemented result in `docs/DEVELOPMENT_LOG.md`. Do not automatically select or implement another phase.
6. **Mandatory GitHub report handoff:** archive a truthful completion report in `docs/reports/`, then update [the latest Codex report](CODEX_LATEST_REPORT.md) with the dated report link, implemented features, actual test/CI status, push confirmation and blockers. Commit and push these records with the implementation. Do not rely on a completion report pasted into chat.

## ChatGPT → GitHub → VS Code workflow

A fresh implementation prompt will be published here and linked above when the user requests it. ChatGPT cannot silently update your local files; run `git pull --ff-only origin Feature` on a clean matching branch to read new remote instructions. Codex should follow the current task file and GitHub documentation, not an outdated prompt pasted in chat.

**Review workflow:** Once Codex has pushed, the user can simply say **"Review the latest GitHub work"**. ChatGPT will fetch `docs/CODEX_LATEST_REPORT.md`, the dated report, current GitHub commits and CI. No copying the long Codex report into ChatGPT is needed. This is an on-request review, not continuous monitoring.

**Current project state:** Phases 0, 1A and 1B were merged into `main` through PR #1. Phase 2A is implemented on `Feature`; no new PR or merge is authorized. The verified real-PYQ catalog remains empty.
