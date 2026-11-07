# Current Codex task

**Status:** Ready for implementation (not yet completed).

**Task:** Phase 2A — PYQ intake, source review and exam-profile foundation.

**Full instructions:** [Phase 2A Codex implementation task](prompts/2026-11-07-phase-2a-pyq-intake-and-profile-foundation.md)

## How to run

1. Check that this file says **Ready for implementation**. If it says completed, stop; do not rerun a completed milestone.
2. Open the existing `rbi-mock-app` workspace, check the current worktree, and remain on `feat/phase-0-foundation`.
3. Read `AGENTS.md` and the **entire** linked implementation task. Read the other existing project docs and source code as instructed.
4. Implement the linked task exactly as written; do not merely summarize it. Test, document, commit and push to the existing branch/PR #1. No new branch/PR and no merge.
5. On completion, change **Status** above to `Completed — awaiting next task`, recording the implemented result in `docs/DEVELOPMENT_LOG.md`. Do not automatically select or implement another phase.

## ChatGPT → GitHub → VS Code workflow

A fresh implementation prompt will be published here and linked above when the user requests it. ChatGPT cannot silently update your local files; run `git pull --ff-only origin feat/phase-0-foundation` on a clean matching branch to read new remote instructions. Codex should follow the current task file and GitHub documentation, not an outdated prompt pasted in chat.

**Current project state:** Phase 0, Phase 1A, and Phase 1B are implemented on the existing branch. Phase 2A is not yet implemented when this task file was published. The verified real-PYQ catalog remains empty.
