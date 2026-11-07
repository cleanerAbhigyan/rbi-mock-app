# Current Codex task

**Status:** Ready for implementation (not yet completed).

**Task:** Phase 2A — PYQ intake, source review and exam-profile foundation.

**Full instructions:** [Phase 2A Codex implementation task](prompts/2026-11-07-phase-2a-pyq-intake-and-profile-foundation.md)

## How to run

1. Check that this file says **Ready for implementation**. If it says completed, stop; do not rerun a completed milestone.
2. Open the existing `rbi-mock-app` workspace, check the current worktree, and work on `Feature`.
3. Read `AGENTS.md` and the **entire** linked implementation task. Read the other existing project docs and source code as instructed.
4. Implement the linked task exactly as written; do not merely summarize it. Test, document, commit and push to `Feature`. PR #1 is already merged; do not create a new PR or merge without user approval.
5. On completion, change **Status** above to `Completed — awaiting next task`, recording the implemented result in `docs/DEVELOPMENT_LOG.md`. Do not automatically select or implement another phase.

## ChatGPT → GitHub → VS Code workflow

A fresh implementation prompt will be published here and linked above when the user requests it. ChatGPT cannot silently update your local files; run `git pull --ff-only origin Feature` on a clean matching branch to read new remote instructions. Codex should follow the current task file and GitHub documentation, not an outdated prompt pasted in chat.

**Current project state:** Phases 0, 1A and 1B were merged into `main` through PR #1. New development proceeds on `Feature`. Phase 2A is not yet implemented when this task file was published. The verified real-PYQ catalog remains empty.
