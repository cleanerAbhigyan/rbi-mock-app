# RBI Grade B Mock App — Phase 2A Codex Implementation Task

**Task:** Build the source-reviewed PYQ intake and official exam-profile **foundation**, with strict provenance and no fabricated question data.

**Status:** Proposed for implementation. This file is an instruction, **not evidence Phase 2A has been completed**.

**Repository:** [cleanerAbhigyan/rbi-mock-app](https://github.com/cleanerAbhigyan/rbi-mock-app)

**Existing branch:** `feat/phase-0-foundation`  
**Existing PR:** [#1](https://github.com/cleanerAbhigyan/rbi-mock-app/pull/1)

## 1. Mandatory starting checks

1. Stay inside `~/projects/rbi-app/rbi-mock-app`. Check `pwd`, `git status -sb`, `git remote -v`, current branch, and upstream. Preserve any uncommitted changes and do not overwrite others' work.
2. **Do not create a branch or PR.** Continue only on `feat/phase-0-foundation`; update existing PR #1 via normal pushes. Do **not** merge into `main`, force-push, or rewrite history.
3. Read `AGENTS.md`, `README.md`, `docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, `docs/DATA_CONTRACT.md`, `docs/ROADMAP.md`, `docs/DEVELOPMENT_LOG.md` and relevant existing implementation/tests.
4. Inspect the actual source code and full Phase 0, 1A, 1B behavior before extending it. The current baseline includes 12 original demo questions, an empty verified-PYQ catalog, an untimed demo, and a custom timed/scored demo. Maintain their working functionality.
5. Relevant canonical Notion product specifications, if the agent can read them:
   - [Exam Experience App](https://app.notion.com/p/410504b1d5b68152b201dc8f784e3468)
   - [PYQ Analysis](https://app.notion.com/p/410504b1d5b68125a29fc8d2317e66a0)
   - [RBI Grade B](https://app.notion.com/p/3ff504b1d5b680eeb770c3395de0fdde)
   These are specifications/source workspaces, **not evidence of imported question papers**. Do not modify Notion in this coding task.

## 2. Scope and success definition

Implement a robust **source-evidence, human-review, and question-import foundation** for future real RBI Grade B previous-year questions, plus a **source-backed exam-profile definition and validation framework**.

There are currently **zero reviewed real PYQs**. This is expected. **Do not manufacture questions, guess answer keys, or mark fake records as verified merely to demonstrate the pipeline.** Keep `src/data/question-bank/verified-pyqs.json` empty unless independently provided legitimate material with evidence and redistribution permission is actually available and reviewed.

Do not interpret a year/phase placeholder in Notion as an imported paper. Do not infer the official 2027 exam scheme from prior years.

The implementation should be useful when real licensed source material arrives, without requiring that data to exist now.

## 3. Preserve strict provenance

Preserve the existing `src/schemas/question.ts` version 1.0 contract where possible. Do not weaken scored-question or verified-PYQ admission rules.

Distinguish clearly:
- Officially sourced/independently verified actual PYQ.
- Memory-based reconstruction.
- Coaching reconstruction.
- Original practice.
- LLM-generated practice.

Only actual historical questions that passed **independent human evidence review** and **redistribution/usage permission checks** may become part of the approved, public-repository verified-PYQ catalog.

The candidate exam does not display keys, provenance hints, explanations, or correctness information before submission in strict mode.

Schema validity is **not** evidence of historical authenticity. A self-declared `verificationStatus: verified` or `approvalStatus: approved` in an imported file is **not itself approval**.

## 4. Introduce source-manifest and review contracts

Define maintainable Zod/TypeScript contracts for:

- Source document record: stable source ID, exam/phase/year/paper, URL or lawful local source reference, document type, publisher/attribution, original document/handout references, retrieval or review metadata, permission/redistribution status, and whether the underlying material can be published.
- Candidate-question intake: stable ID, revision, source ID and source question number, imported raw/normalized text and options (or approved reference), original category, key/evidence references, marks/penalty evidence, extraction confidence/ambiguity notes.
- Independent human review decision: question ID/revision, source ID, actual evidence checked, answer-key evidence checked, normalization corrections, reviewer approval/rejection with review date, rights decision, and documented limitations.
- A versioned import envelope/batch with a distinct schema version and traceable import batch ID.

Use consistent, auditable IDs and reject duplicate IDs or duplicate source/question-number combinations within an intake batch, with actionable error messages. Never automatically rewrite bad or ambiguous content into a purported verified question.

Choose a lightweight representation that fits this repository; avoid needless backend infrastructure.

## 5. Safe intake and promotion pipeline

Implement deterministic, testable steps:

1. Ingest a locally supplied JSON batch or an explicit import command (no automatic internet scraping).
2. Validate the batch and source metadata **atomically**; report detailed errors rather than dropping invalid records.
3. Normalize supported fields using documented rules without modifying substantive question meaning or inventing absent keys.
4. Detect and flag possible duplicates for **human review** rather than silently merging near-duplicates.
5. Store staged/unreviewed information separately from approved runtime catalog; keep nonredistributable or private source documents outside Git.
6. Require an explicit, validated review artifact and rights permission before generating any approved public-catalog output.
7. Reject a candidate for promotion when source/category, answer-key evidence, scoring, year/phase, question number, reviewer decision, or redistribution status is incomplete or inconsistent.
8. Preserve traceability from approved question to source and review record. Provide a reproducible CLI/check workflow, or a similarly simple maintainable tool.
9. No silent partial imports. On validation failure, leave the approved catalog untouched.
10. Keep imported historical records separate from existing runtime demo question providers and test-only fixtures.

The human approval artifact is procedural documentation, not cryptographic or automated proof that the paper is genuine. State this limitation explicitly.

For public GitHub, never commit a nonredistributable exam paper, private source extraction, protected personal data, or credentials. If no lawful sample exists, use **explicitly synthetic records confined to tests** to exercise positive and negative validation paths without publishing them as PYQs.

Do not add a way for a user-supplied arbitrary JSON file to grant itself actual-PYQ approval.

## 6. Exam profile contract and verified sources

Implement a separate, versioned, strongly validated exam-profile registry/loader that can eventually represent:

- Exam, phase, year/reference label, revision and source status.
- Official document URL/ID, publisher, notice/handout details, verification notes and verification date.
- Sections and permitted ordering/navigation; per-section question counts and durations when sourced.
- Scoring and negative-marking configuration, including per-question/section overrides where needed.
- Locked versus free navigation and validity bounds.
- Clear separation between **custom practice** and **official-source-verified reference** profiles.

The current custom 60-second section profile must remain labeled custom and **must not become an official 2027 profile**.

Only add a sourced, historically labeled official reference profile if the underlying official notice/handout is accessible and all the values in that profile were actually cross-checked and cited in the repository docs. If verification is unavailable, leave the official-profile registry without claimed official patterns, and support a clear "awaiting source verification" state.

For 2027, display "awaiting official notification" until an authentic matching notice is verified. Never silently reuse 2025/2026 rules or invent a timetable.

Keep the source-backed profile loader independent of the existing custom practice implementation. An eventual official mock will need an adequate verified paper bank and validated matching profile.

## 7. User interface and operator workflow

Keep Phase 0/1A/1B routes working as before.

If UI is appropriate, provide a **read-only** informational source-readiness view or extend the existing question-bank page showing truthful counts, source/review status, and clear operator instructions without implying data imports already happened.

Avoid building a complex publicly accessible import/editor UI or exposing privileged promotion functionality in the browser; a documented local developer workflow is sufficient in Phase 2A.

No fake source totals, exams, attempts, scoring or imported records.

## 8. Tests and acceptance coverage

Preserve all existing tests and browser journeys. Add deterministic tests for:

- Valid/invalid source manifests and intake envelopes.
- Required citations/references and option/answer-key integrity.
- Duplicate IDs and duplicate source-question identifiers.
- Provenance category preservation.
- Separate raw/staged/reviewed/approved states.
- Human review required regardless of imported "verified" flags.
- Rejection of missing answer-key evidence, missing rights, unsupported phase/year and ambiguous approval.
- Atomic rejection: failed imports never mutate the approved catalog.
- Approved-question traceability to review/source decisions.
- Custom versus verified-reference exam-profile validation.
- Invalid section ordering, time allocation, question counts and scoring metadata.
- No fabricated/unverified official 2027 profile.
- The existing real-PYQ catalog stays empty in normal app runtime.
- The untimed and timed demo engines continue working unchanged.

If frontend changes are made, add relevant React tests and Playwright journeys. Run the existing Playwright suite even if only data contracts changed, where the environment permits.

Do not introduce a data provider that leaks keys/explanations into pre-submission candidate UI.

## 9. Out of scope

Do **not** add:
- Fabricated real PYQs or sample papers misrepresented as genuine.
- Unapproved copyrighted/redistribution-restricted question-paper contents to the public repo.
- Unverified 2027 exam profiles, eligibility, dates or paper details.
- Automated scraping, OCR, paid-content bypass or LLM prediction.
- `question-predictor` repo coupling, monorepo, shared workspace, cloud database, authentication or deployment.
- Phase II descriptive editor or a full question-editing CMS.
- Changes to Notion records or fabricated mock attempt history.
- A merged PR.

## 10. Documentation and GitHub requirements

Update the existing files accurately:

- `README.md`
- `AGENTS.md` only when new rules are needed
- `docs/PROJECT_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_CONTRACT.md`
- `docs/ROADMAP.md`
- `docs/DEVELOPMENT_LOG.md`
- `CHANGELOG.md`

Use **this document** as the sanitized task prompt record. Do not create another duplicated prompt. Keep `docs/CODEX_NEXT_TASK.md` pointing to this task until completion, then change its status to **completed / awaiting next task**, so the short launcher cannot accidentally rerun it. Do not invent a future implementation spec without authorization.

Explain ingestion commands, review gate, rights and licensing caveats, source evidence limits, profile registration, tests, actual imported question counts and explicit unimplemented features.

Validate with:

```bash
npm ci
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
npm run test:e2e
```

Also run any new intake/profile validation checks and document their outcomes. If a check cannot run, report the real blocker.

After implementation and passing relevant checks:
1. Confirm still on `feat/phase-0-foundation`.
2. Review changes, check for secrets and source-material rights.
3. Commit code, tests, docs and status update together on the **existing branch**.
4. Push to `origin/feat/phase-0-foundation`, verify remote commit SHA, and update existing PR #1 automatically.
5. Inspect GitHub Actions and fix failures caused by this work when possible. Report any pending checks.
6. Do not create a new branch or PR, do not merge to `main`, and do not force push.

## 11. Completion report

Provide:
1. Concrete features implemented and files changed.
2. Source/import/review/profile schema design and CLI usage.
3. Current approved real-PYQ count, with no invented data.
4. Validation tests, Playwright and browser QA results.
5. Docs updated and current task status.
6. Branch, implementation commit SHA, remote push verification and PR #1 status.
7. GitHub Actions run/result and known limitations.
8. Recommendation for a future milestone, explicitly not implemented.

**BEGIN IMPLEMENTING THIS PHASE 2A TASK. Do not stop at planning; do not create a branch, another PR, or merge.**
