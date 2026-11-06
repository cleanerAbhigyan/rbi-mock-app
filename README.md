# RBI Grade B Mock Exam Simulator

Independent, personal-practice computer-based examination simulator for RBI Grade B (DR–General). **Not affiliated with RBI or IBPS.**

## Project layout and relationship

- **This repository:** `rbi-mock-app` — application UI, exam engine, question-bank validation, attempts and analytics.
- **Separate future project:** [question-predictor](https://github.com/cleanerAbhigyan/question-predictor) — PYQ pattern analysis, backtesting and original practice-question generation.
- **Local workspace:** `~/projects/rbi-app/rbi-mock-app`, alongside independent sibling `~/projects/rbi-app/question-predictor`.
- These are **two independent Git repositories**, not a monorepo; no cross-repository runtime dependency is needed now.

## Planned first implementation

React + TypeScript + Vite, Tailwind CSS, Zustand, local-first storage and automated tests. Build the Phase I CBT experience (instructions, timer, question palette, distinct draft/saved answers, marking, submission and post-test review) before Phase II and analytics.

**Question policy:** verified, reviewed, source-attributed historical PYQs are the intended real question source. If none are imported, show an empty state. Synthetic/original developer fixtures may be used only for clearly labeled demos and automated tests. Never fabricate or relabel PYQs.

The 2027 RBI examination pattern remains unconfirmed until an official notice; use versioned source-backed exam profiles.

## Development status

This README records the agreed architecture; it is **not evidence that the simulator has been implemented or tested**. See [Project context](docs/PROJECT_CONTEXT.md) and [Agent instructions](AGENTS.md).

## GitHub–Notion–ChatGPT continuity

- **GitHub:** actual committed code and implementation documentation.
- **Notion:** product requirements, source research and study-tracker context.
- **ChatGPT:** coordinates work by reading current Notion and GitHub information when asked.
- Synchronization is a **deliberate per-change workflow**, not automatic real-time three-way mirroring. For every coding task, archive the sanitized prompt, update docs and tests, commit and push; report SHA and blockers. Update Notion from confirmed implementation evidence, not proposals.

Do not commit tokens, private test history, or question papers lacking redistribution rights. This repository is currently public.
