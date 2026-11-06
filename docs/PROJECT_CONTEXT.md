# Project Context — Exam Simulator

_Last recorded architecture decision: 2026-11-07. This is a planning snapshot, not a claim of completed development._

## Project

Build a personal RBI Grade B (DR–General) CBT-style mock examination application with Phase I first and Phase II later. No RBI/IBPS affiliation.

## Ownership and repository boundaries

- Working folder: `~/projects/rbi-app/rbi-mock-app`
- Source repository: `cleanerAbhigyan/rbi-mock-app`
- Future producer (separate repo): `cleanerAbhigyan/question-predictor`
- No monorepo, common workspace package, direct runtime coupling, or premature model integration.

## Requirements and source-of-truth order

1. Notion's **Exam Experience App** describes intended product behavior and official-source caveats.
2. This GitHub repository records what is actually implemented.
3. ChatGPT reads both when planning future work; prior chat summaries are snapshots, not live code state.

## Current priorities

- Repository-level development conventions and documentation.
- Configurable source-backed exam profiles; 2027 pattern unconfirmed.
- Phase I CBT MVP with draft-vs-saved answer behavior, five palette states, refresh-safe deadline, submission, and testable scoring.
- Import **real** question content only after PYQ provenance and answer keys are reviewed.
- Isolated synthetic fixtures for development only.

## Deferred work

Phase II, attempt analytics, source-document extraction, Notion result export, and any generated-question import. The prediction service will later publish a **versioned validated question export** containing stable IDs, source type, answer-key evidence, model/run IDs where applicable, and human approval status. Never treat generated practice as historical PYQs.

## Sync protocol

At each implementation milestone: `git status` → pull safely → archive sanitized prompt in `docs/prompts/` → implement/tests → update README, PROJECT_CONTEXT, ROADMAP, DEVELOPMENT_LOG → commit → push → report SHA and test results. Coordinate any factual status updates into Notion only after implementation evidence is available and authorized.

Never expose secrets, private attempt records or non-redistributable papers in this public repository.
