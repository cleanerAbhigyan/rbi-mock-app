<!-- Sanitized task record: 2026-11-07, America/Los_Angeles. No credentials, personal attempts or restricted papers supplied. -->

# RBI GRADE B MOCK APP — PHASE 1B

# TIMING, SECTION LOCKS, PERSISTENCE, SUBMISSION & SCORING

You are my senior TypeScript/React engineer, examination-system architect, testing engineer, and GitHub documentation maintainer.

Your task is to implement, test, document, commit, and push **Phase 1B — Timed Mock Examination Engine**.

Work directly inside the existing VS Code workspace. Deliver functioning code, not a plan or pseudocode.

## 1. Project and branch rules

**Repository:** https://github.com/cleanerAbhigyan/rbi-mock-app

**Local path:** `~/projects/rbi-app/rbi-mock-app`

**Existing branch:** `feat/phase-0-foundation`

**Existing pull request:** https://github.com/cleanerAbhigyan/rbi-mock-app/pull/1

MANDATORY:

- Continue on the existing `feat/phase-0-foundation` branch.
- Do not create another Git branch.
- Do not create another pull request.
- Do not merge into `main`.
- Do not force-push or rewrite history.
- Commit and push completed work to the existing development branch.
- Preserve everything implemented in Phases 0 and 1A.

The user will decide when the pull request is ready to merge.

## 2. Read the existing implementation

Before coding:

1. Check `git status -sb`, the active branch, remotes, and current commit.
2. Preserve any uncommitted changes.
3. Read `AGENTS.md`, `README.md`, and all existing project documentation.
4. Read the actual Phase 1A source and tests.
5. Inspect `src/features/exam/demo-session.ts`, `demo-profile.ts`, the demo session store, question repositories, question schemas, and UI components.
6. Confirm GitHub is synchronized safely.
7. Read the current Notion specification if available.

Notion specification:

https://app.notion.com/p/410504b1d5b68152b201dc8f784e3468

GitHub is authoritative for actual implementation; Notion is authoritative for intended requirements.

Do not edit Notion directly during this coding task.

## 3. Current Phase 1A baseline

The existing app has:

- A working React/TypeScript/Vite application.
- An untimed and unscored Phase I interaction demo.
- 12 original questions across four sections.
- Candidate instructions and agreement.
- Section tabs and question navigation.
- Draft and saved response separation.
- Save & Next, Mark for Review & Next, Clear Response.
- Independent review-flag removal.
- Five derived palette statuses.
- Existing unit and component tests.
- An empty verified-PYQ catalog.

The current milestone reports 79 passing tests.

Do not break the existing untimed demo. Its behavior and routes should continue working unless a clearly justified, backward-compatible refactor is necessary.

## 4. Phase 1B objective

Add a separate, fully functional **timed and scored practice experience** based on the existing Phase I demo questions.

The candidate must be able to:

1. Start a timed custom practice mock.
2. View an accurate countdown.
3. Answer questions within the active section.
4. Save answers and mark questions for review.
5. Experience configured section deadlines and locks.
6. Refresh the page without resetting time or saved responses.
7. Submit the examination manually.
8. Have the examination submitted automatically when the allotted time expires.
9. Receive an accurate result computed from committed saved answers.
10. Review solutions only after final submission.

Keep the original untimed interaction demo available.

Do not claim this is a complete official RBI Grade B examination.

## 5. Configurable timed practice profile

Implement a versioned, explicitly custom timed profile.

Use the four existing Phase I sections:

- General Awareness
- English Language
- Quantitative Aptitude
- Reasoning Ability

Use the existing 12 original demo questions.

Configure per-section durations and section-navigation behavior through typed profile data rather than scattered UI constants.

Use reasonable short durations for this custom demo, chosen to make manual testing practical.

Provide a fast automated-testing configuration through injected settings or test fixtures, not a production shortcut that allows users to bypass strict timing rules.

IMPORTANT:

- The profile must be labeled `CUSTOM TIMED PRACTICE — NOT OFFICIAL RBI EXAM PATTERN`.
- Do not invent or claim official 2027 question counts, scoring, section durations, or exam dates.
- The existing custom demo source classification and provenance rules must be preserved.
- Keep official-profile support extensible for a later source-verified phase.

The real PYQ catalog must remain empty.

## 6. Candidate flow

Extend the dashboard with a clearly labeled timed practice entry.

Suggested flow:

Dashboard → Timed Practice Instructions → Begin Timed Mock → Candidate Exam → Submit or Timeout → Results → Review

Use appropriate React Router routes, for example:

- `/demo/timed/instructions`
- `/demo/timed/exam`
- `/demo/timed/results`

Adapt paths to the existing architecture if necessary.

The existing untimed routes must remain functional.

The timed instructions screen must clearly explain:

- This is original practice material, not actual PYQs.
- The custom per-section durations.
- Section order and locking.
- How saved and unsaved answers behave.
- Review flags.
- Automatic advancement at section expiry.
- Automatic submission at the final deadline.
- Manual early submission and confirmation.
- The configured marking and negative-marking rules.
- Refresh/recovery behavior.
- When solutions become available.

Require explicit acknowledgment before Begin Timed Mock is enabled.

## 7. Timer architecture

Implement accurate, wall-clock-based timers.

DO NOT implement the countdown by merely decrementing an in-memory number every second.

Use absolute deadlines derived from a trusted application timestamp at the start of the attempt.

The visible countdown can update through an interval, but the remaining time must always be computed from the persisted deadline and current clock.

For deterministic tests, inject the current time through a clock function or equivalent domain dependency.

Timer calculations and expiry transitions must be independent of React rendering.

Required behavior:

- Starting the mock initializes the attempt start time once.
- Each section has a configured duration.
- Section boundaries follow the profile's sequence.
- A page refresh does not reset or extend the exam.
- Background-tab throttling does not extend the exam.
- Returning after a section deadline must reconcile the expired section.
- Remaining time never becomes negative.
- After all allotted time expires, the attempt becomes submitted automatically.
- The timer stops affecting the attempt after submission.

Critically, if the browser was closed for longer than one or more section durations, calculate the correct elapsed section boundaries from the original schedule. Do not grant fresh time merely because the page reopened.

Avoid using the client's local wall clock as a security guarantee; document that this local-first simulator cannot prevent deliberate clock manipulation.

## 8. Section locking

Implement section rules from the configured practice profile.

For this timed demo, use sequential locked sections:

- Only the active section is editable.
- Candidates may navigate between questions inside the active section.
- Earlier expired sections are locked.
- Candidates cannot manually enter a future section before its time.
- When the active section expires, advance to the next configured section.
- Preserve committed responses from completed sections.
- At the final section deadline, auto-submit the attempt.

Make section navigation and locking explicit in the state model.

Do not blindly reuse Phase 1A's free section navigation for strict timed mode.

Tests must verify that expired or inaccessible sections cannot be modified through UI actions or direct state commands.

## 9. Attempt state and persistence

Implement versioned local persistence for the active timed attempt.

Use the existing local-first architecture; no backend is necessary.

Persist sufficient validated information to restore:

- Attempt ID.
- Attempt schema version.
- Exam profile ID and revision.
- Attempt start time.
- Section deadlines or an equivalent immutable schedule.
- Active or derived current section.
- Active question.
- Visited question IDs.
- Committed saved responses.
- Review flags.
- Submission status and timestamp.
- Required question/profile revision references.

Retain the identity and scoring metadata needed for an auditable result.

Use Zod validation or an equally strict versioned contract when restoring data.

If persisted data is corrupt, outdated, or inconsistent with the current profile/question revision, fail safely and explain recovery rather than silently scoring incorrect data.

Never store an unsaved draft as a committed answer.

On refresh, either discard the draft or restore it explicitly as a draft; document and test the chosen behavior. The simpler preferred approach is to restore from the committed saved response.

Avoid writing an unlimited attempt-history system. That belongs to a later milestone.

Keep the latest completed timed attempt/result available for immediate results review and refresh recovery, without claiming that a full history dashboard exists.

## 10. Preserve Phase 1A answer semantics

Reuse or carefully generalize the existing pure exam-state transitions.

For timed mode:

- Selecting an option updates the draft.
- Save & Next commits the draft.
- Mark for Review & Next commits a selected answer and sets the review flag.
- Palette navigation does not save a draft.
- Returning to a question restores a committed response.
- Clear Response clears the active draft and committed answer.
- Review flags remain independent.
- Only committed saved responses are eligible for scoring.
- An answered-and-marked-for-review response is eligible for scoring.
- An unanswered review flag does not count as an attempted answer.

Every state-changing command must also respect the attempt's current timing, section lock, and submission status.

Actions after a deadline must not mutate already expired sections.

Actions after final submission must not modify examination responses.

## 11. Manual and automatic submission

Implement final submission.

### Manual submission

Provide a clear Submit Exam action.

Clicking it must open an accessible confirmation dialog.

The dialog should show relevant progress counts and warn that submission is final.

Provide:

- Cancel / Continue Exam
- Confirm Submission

Cancel must preserve the active attempt.

Confirm must finalize the attempt, freeze responses, and navigate to results.

### Automatic submission

At the final exam deadline, submit without requiring confirmation.

This must work when:

- The tab is open.
- The browser was backgrounded.
- The user reloads after expiry.
- The user returns after the deadline.
- The timer and an answer-saving action occur nearly simultaneously.

Submission must be **idempotent**.

Repeated submission events must not create multiple result records, modify the original submission timestamp, or cause repeated scoring side effects.

Define deterministic behavior at the exact deadline boundary and test it.

## 12. Scoring architecture

Implement pure, independently testable objective scoring functions.

Use validated answer-key and marks metadata.

IMPORTANT:

Phase 1A intentionally removed answer keys and explanations from the candidate-facing question projection.

Preserve that boundary.

Create a separate, validated, internal scoring-data provider for the original demo questions.

Do not expose correct answers through candidate UI props or state before submission.

Do not weaken the verified-PYQ catalog admission rules.

Demo questions may be scored using their original validated answer keys, but scoring them does not make them actual PYQs or approved historical questions.

### Scoring rules

For each question:

- Correct committed response: configured positive marks.
- Incorrect committed response: configured negative marks deducted.
- No committed response: zero marks.
- Answered and marked for review: score normally.
- Unanswered and marked for review: zero marks.

Use the configured per-question values, including explicitly permitted zero negative marking.

Calculate:

- Total score.
- Maximum possible marks.
- Correct answers.
- Incorrect answers.
- Unanswered questions.
- Attempted count.
- Accuracy percentage.
- Section-wise scores and counts.

Use deterministic numeric handling so decimal penalties do not produce misleading floating-point artifacts.

Validate that saved question IDs, revisions, and option IDs correspond to the attempt's question set.

Never score answers from unsaved drafts.

Do not invent official RBI cutoffs, qualification status, rank, percentile, or predicted examination performance.

## 13. Results and review interface

Create a post-submission results page.

Display:

- Timed practice title.
- Custom-demo disclaimer.
- Submission reason: manual or time expiry.
- Total score and maximum marks.
- Number of attempted questions.
- Correct, incorrect, and unanswered counts.
- Accuracy.
- Section-wise breakdown.
- Review of saved answers and correct answers.
- Explanations, where available in the validated original demo content.

Mark unanswered questions accurately.

Do not show the result page as a completed exam before the attempt is actually submitted.

If no submitted result is available, redirect or display a clear empty state.

Ensure the result view remains usable after refreshing the page.

No fabricated historical attempts or analytics.

## 14. Accessible and responsive interface

Extend the existing Phase 1A design.

Add:

- Readable countdown with clear time units.
- Visible current-section indicator.
- Locked-section indicators.
- Deadline/expiry notices.
- Accessible submission confirmation.
- Clear submitted-state transition.
- Readable result summary.
- Responsive results and exam layout.
- Keyboard-accessible controls.
- Visible focus indicators.
- Text labels in addition to color.

Maintain the existing light theme and independent-software disclaimer.

Never use official RBI logos.

Do not make claims about pixel-perfect fidelity to the official exam portal.

## 15. Automated tests

Preserve all existing Phase 0 and Phase 1A tests.

Add comprehensive domain, persistence, scoring, and UI tests covering at minimum:

1. Timed attempt initializes correctly.
2. Countdown begins only when the mock starts.
3. Per-section deadlines are derived correctly.
4. Time cannot increase simply because the UI re-renders.
5. Background-tab delays do not grant extra time.
6. An expired section automatically locks.
7. The next section becomes active at the correct boundary.
8. Future sections cannot be accessed prematurely.
9. Expired sections cannot accept saves or other mutations.
10. Multiple elapsed section deadlines are reconciled correctly after reopening.
11. Refresh restores committed responses and review flags.
12. Refresh does not reset deadlines.
13. Corrupt or stale persisted attempts fail safely.
14. Drafts are never promoted into saved answers on refresh.
15. Save & Next follows existing semantics.
16. Review flags remain independent.
17. Answered-and-reviewed questions are scored.
18. Marked-for-review without answer remains unattempted.
19. Manual submission requires confirmation.
20. Canceling confirmation retains the active attempt.
21. Confirming submission freezes the attempt.
22. Automatic submission occurs at final expiry.
23. Multiple submit events are idempotent.
24. Submission and save actions at expiry behave deterministically.
25. Post-submission state cannot be modified.
26. Correct, incorrect, and unanswered scoring is accurate.
27. Negative marking is applied correctly.
28. Decimal scoring is handled correctly.
29. Section and overall totals reconcile.
30. Result refresh/recovery works.
31. Pre-submit pages do not reveal answer keys/explanations.
32. Post-submit review shows correct solutions.
33. The verified-PYQ catalog remains unchanged.
34. Existing untimed demo and all previous tests continue working.

Use fake or injected clocks and deterministic test fixtures. Avoid slow, real-time sleeps.

## 16. Browser end-to-end testing

Introduce Playwright for real browser verification.

Cover critical journeys, ideally including:

- Starting and completing a small timed custom mock.
- Saving an answer and refreshing without resetting the countdown.
- Section expiration and locking.
- Manual confirmation/submission.
- Automatic submission at timeout.
- Result and solution visibility.

Prefer deterministic test-specific time settings that do not weaken production behavior.

Add clear Playwright scripts/documentation.

Where practical, configure GitHub Actions to run browser tests with appropriate browser installation and reasonable timeouts.

If the environment cannot launch a browser, report the exact blocker. Do not invent passing E2E results.

Keep unit and component tests as the primary fast feedback layer.

## 17. Scope boundaries

Do NOT implement:

- Official 2027 exam profiles without verified notices.
- Real PYQ collection or scraping.
- PDF ingestion.
- Predictive question generation.
- Direct `question-predictor` integration.
- Phase II descriptive papers.
- User accounts or authentication.
- Cloud storage or backend databases.
- Deployment.
- Full historical mock-attempt analytics.
- Automatic Notion synchronization.
- Updates to Notion study trackers.

Maintain a small and reliable Phase I timed-demo implementation.

## 18. Mandatory repository documentation

Documentation is part of this implementation.

Update existing files rather than creating duplicate versions:

- `README.md`
- `AGENTS.md`, only if instructions need clarification
- `docs/PROJECT_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_CONTRACT.md`
- `docs/ROADMAP.md`
- `docs/DEVELOPMENT_LOG.md`
- `CHANGELOG.md`

Create a new sanitized record under:

`docs/prompts/2026-11-07-phase-1b-timing-submission-scoring.md`

If the filename already exists, choose a unique descriptive alternative.

Document:

- Actual implemented timer model.
- Deadline calculation and section-lock behavior.
- Persistence schema and recovery behavior.
- Answer-state invariants.
- Submission lifecycle and idempotency.
- Scoring rules and limitations.
- Result-view functionality.
- Tests actually executed.
- Browser QA status.
- GitHub commit and CI evidence.
- Deferred roadmap features.

Mark Phase 1B complete only if the implementation and acceptance tests pass.

Do not mark Phase II or future features completed.

No Notion writes are authorized in this prompt.

## 19. Mandatory validation

Run:

```bash
npm ci
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
```

Run the Playwright checks where the environment supports them.

Fix formatting issues and repeat validation.

If a test cannot run, document the actual limitation rather than claiming success.

Review changed files and check for secrets, copyrighted papers, and unrelated modifications.

Do not commit personal test histories, credentials, `.env` files, or restricted source documents.

## 20. GitHub synchronization

Keep the current branch:

`feat/phase-0-foundation`

DO NOT create another branch.

DO NOT create another pull request.

DO NOT merge into `main`.

After implementation:

1. Review the complete change set.
2. Update the repository documentation.
3. Archive this sanitized prompt.
4. Run all applicable checks.
5. Stage code, tests, documentation, and prompt history.
6. Commit with a descriptive message such as `feat: implement Phase 1B timed demo and scoring`.
7. Push to `origin/feat/phase-0-foundation`.
8. Verify the commit SHA on GitHub.
9. Verify existing PR #1 contains the latest code.
10. Inspect the latest GitHub Actions run.
11. If CI fails, inspect and fix the failure.
12. Report any unresolved blocker honestly.

Do not automatically merge the PR, regardless of CI results.

## 21. Acceptance criteria

Phase 1B is complete when:

- The existing untimed Phase 1A demo still works.
- A separate timed demo is runnable.
- Deadlines and section locks are correctly enforced.
- Refreshing cannot reset examination time.
- Saved answers survive refresh.
- Unsaved drafts do not become scored answers.
- Expired sections cannot be edited.
- Manual confirmation and final submission work.
- Final timeout submits automatically.
- Repeated submission cannot duplicate results.
- Scoring is correct, including negative marking and reviewed answers.
- Results and explanations appear only after submission.
- Results remain available after refresh.
- The verified-PYQ catalog remains empty.
- Previous and new automated tests pass.
- Documentation reflects actual implementation.
- Changes are committed and pushed to the existing branch.
- PR #1 remains open and unmerged.

## 22. Final completion report

Return a report with:

1. Implemented features.
2. Timed exam routes.
3. Timer and section-lock architecture.
4. Persistence strategy.
5. Submission and scoring behavior.
6. Actual tests passed.
7. Playwright and browser QA outcome.
8. Production build outcome.
9. Files changed.
10. Documentation updates.
11. Archived prompt path.
12. Active branch.
13. Implementation commit SHA.
14. Final push SHA.
15. PR #1 status.
16. GitHub Actions run URL and result.
17. Outstanding limitations.
18. Recommended next milestone.

**BEGIN PHASE 1B IMPLEMENTATION NOW. PRESERVE PHASES 0 AND 1A. REUSE THE EXISTING BRANCH AND PR. DO NOT MERGE INTO MAIN.**
