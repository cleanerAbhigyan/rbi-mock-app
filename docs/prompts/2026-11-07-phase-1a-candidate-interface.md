<!-- Sanitized implementation prompt archived 2026-11-07 (America/Los_Angeles). No credentials, private attempts or copyrighted papers supplied. -->

# RBI GRADE B MOCK APP — PHASE 1A

# COMPLETE CODEX IMPLEMENTATION PROMPT

You are my senior software engineer, React/TypeScript architect, exam-experience designer, automated testing engineer, and GitHub documentation maintainer.

**Your task is to IMPLEMENT, TEST, DOCUMENT, COMMIT, and PUSH Phase 1A — Candidate Exam Interface & Answer Management.**

Do not stop at a plan. Make the required code changes directly in the currently opened VS Code repository.

---

## 1. Project identity

**Project:** RBI Grade B Mock Exam Simulator

**Local directory:** `~/projects/rbi-app/rbi-mock-app`

**GitHub repository:** https://github.com/cleanerAbhigyan/rbi-mock-app

**Existing development branch:** `feat/phase-0-foundation`

**Existing pull request:** https://github.com/cleanerAbhigyan/rbi-mock-app/pull/1

**Important: The user has explicitly decided to reuse the existing development branch for all upcoming development milestones.**

You MUST:

- Stay on `feat/phase-0-foundation`.
- Never create a new branch.
- Never create another pull request.
- Never merge into `main`.
- Never force-push or rewrite remote history.
- Push changes to the existing feature branch.
- Keep Pull Request #1 updated automatically through those pushes.
- Only consider merging into `main` after explicit user approval at a stable, tested milestone.

These instructions override older recommendations in repository documentation that suggest creating a new branch for every feature.

## 2. Repository inspection — mandatory

Before modifying code:

1. Confirm the working directory.
2. Run `git status -sb`.
3. Run `git branch --show-current`.
4. Run `git remote -v`.
5. Check the latest remote changes without overwriting local work.
6. Confirm the active branch is `feat/phase-0-foundation`.
7. Read all existing project documentation.
8. Inspect the existing React application, Zod question schema, data repositories, stores, routes, and automated tests.

Read these files where present:

- `AGENTS.md`
- `README.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_CONTRACT.md`
- `docs/ROADMAP.md`
- `docs/DEVELOPMENT_LOG.md`
- `CHANGELOG.md`

The user has already pulled the existing branch successfully. Do not repeat destructive Git operations or reset the repository.

If there are local uncommitted changes or divergent history, preserve them. Explain any genuine conflict rather than overwriting work.

Do not reinitialize Git, replace existing project files unnecessarily, or create a monorepo.

## 3. Notion requirements

Use the following Notion pages as product specifications when accessible:

**Exam Experience App:**
https://app.notion.com/p/410504b1d5b68152b201dc8f784e3468

**RBI Grade B:**
https://app.notion.com/p/3ff504b1d5b680eeb770c3395de0fdde

**PYQ Analysis:**
https://app.notion.com/p/410504b1d5b68125a29fc8d2317e66a0

If Notion is inaccessible, proceed using the requirements in this prompt and existing GitHub documentation.

The app is independent personal-practice software, not official RBI or IBPS examination software.

Do not imply official affiliation.

The RBI Grade B 2027 examination pattern has not been confirmed. Never present an assumed 2027 scheme as official.

Do not modify Notion pages or databases during this Codex task.

## 4. Current implementation

Phase 0 is already implemented.

The repository contains:

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Zustand
- Zod
- Vitest and React Testing Library
- ESLint and Prettier
- Dashboard and question-bank screens
- Validated question schema version 1.0
- Verified-PYQ catalog with zero actual questions
- Isolated synthetic developer test fixtures
- GitHub Actions CI
- Architecture and development documentation

Preserve existing behavior and tests.

Do not replace the technology stack.

Use Node 24 LTS, npm, and the committed lockfile.

## 5. Phase 1A objective

Implement the first interactive RBI Grade B Phase I candidate experience.

By the end of this milestone, the user must be able to:

1. Open the application.
2. Select an explicitly labeled Phase I demonstration.
3. Read candidate instructions.
4. Accept the instructions.
5. Begin the demonstration.
6. Navigate between Phase I sections and questions.
7. Select answers.
8. Save answers.
9. Mark questions for review.
10. Clear responses.
11. Observe accurate question-palette statuses.
12. Navigate without accidentally saving unsaved selections.

This milestone is an **untimed, unscored interaction demo**.

Timers, final submission, scoring, result dashboards, and persistent attempts belong to Phase 1B or later.

Do not pretend those features already exist.

---

## 6. Demo question data

The initial production PYQ catalog must remain empty unless authentic, reviewed historical questions have independently been imported.

Do not generate or fabricate historical RBI PYQs.

For Phase 1A, create a separate original demonstration dataset that contains questions across all four Phase I sections:

- General Awareness
- English Language
- Quantitative Aptitude
- Reasoning Ability

Use enough questions to exercise navigation between multiple items within each section.

Label this question source clearly:

**DEMO PRACTICE — NOT ACTUAL RBI PYQs**

IMPORTANT DATA BOUNDARIES:

- Keep the verified-PYQ catalog unchanged.
- Keep the existing `src/data/fixtures/` test-only directory isolated.
- Do not import existing test fixtures into runtime application modules.
- Create a separately named runtime demo-data provider.
- Validate demo questions using existing Zod contracts.
- Do not weaken `verifiedPyqSchema` or the actual-PYQ admission rules just to load demo content.
- Never label synthetic demo records as actual PYQs.
- Do not mix future model-generated questions into this work.

Use the existing question repository design where appropriate, but keep demo-question access explicitly separated from verified historical-question access.

Document the separation in `docs/DATA_CONTRACT.md` and `docs/ARCHITECTURE.md`.

## 7. Dashboard integration

Modify the existing dashboard to introduce a working entry point:

**Try Phase I Demo**

This entry should be clearly labeled as a development practice demonstration, not an official mock examination.

The dashboard should continue showing:

- Verified PYQ count
- Empty-state message when no actual PYQs exist
- RBI Grade B 2027 pattern notice
- Independent-software disclaimer
- Phase II and other unfinished options marked unavailable

Add a route for the candidate instructions and another for the demo exam interface.

Suggested routes:

- `/demo/instructions`
- `/demo/exam`

Adapt route names if the existing routing architecture requires it, and document the final paths.

Navigation should work using React Router without unnecessary full-page reloads.

## 8. Candidate instructions screen

Create an instruction page that includes:

- Demo title
- Selected profile
- Four available Phase I sections
- Total number of demo questions
- Question-palette status legend
- Answer-saving instructions
- Mark-for-review instructions
- Navigation instructions
- Clear Response instructions
- Demo limitations
- Independent-software disclaimer

Add a required checkbox:

"I have read and understood the instructions."

Add a **Begin Demo** button.

The Begin Demo button must remain disabled until the checkbox is selected.

When the user begins:

- Initialize a fresh demo attempt in memory.
- Set the first permitted question as active.
- Initialize question-visit tracking.
- Clear any previous demo draft/saved-answer state.
- Navigate to the candidate exam screen.

If a user opens the exam URL without starting a session, redirect safely to the instructions page.

Do not start a countdown timer or claim a scored attempt has begun.

## 9. Candidate examination interface

Build a professional computer-based examination interface.

Use a desktop-first layout with responsive behavior for smaller screens.

### Top header

Display:

- RBI Grade B Phase I — Demo
- A visible demo-mode indicator
- Current section name
- Question progress
- Clear indication that this version is untimed

Do not display a fake timer.

### Section navigation

Display four section tabs:

1. General Awareness
2. English Language
3. Quantitative Aptitude
4. Reasoning Ability

Section tabs should update the active section.

Ensure each section maintains its own questions and statuses.

When switching between sections, unsaved draft answers must not become committed answers.

### Question panel

Display:

- Question number
- Question text
- Answer options
- Question-specific marks if available in the demo configuration
- Clearly visible selected response

Use accessible radio controls or equivalent keyboard-accessible components.

Keep explanations and correct-answer indicators hidden during the demo exam.

### Question palette

Show numbered question buttons for the active section.

Implement five distinct states:

1. Not Visited
2. Not Answered
3. Answered
4. Marked for Review — Not Answered
5. Answered and Marked for Review

Use more than color to distinguish statuses. Include meaningful accessible names or visual indicators.

Show accurate counts for the different states.

Make it clear which question is currently active.

### Bottom controls

Implement:

- Previous Question
- Next Question
- Save & Next
- Mark for Review & Next
- Clear Response

Also provide an explicit, accessible way to remove a question's review flag without unintentionally changing its saved answer.

All actions must be functional.

The first and last question boundaries must be handled gracefully.

Do not introduce an automatic submission when reaching the last question.

Do not add a nonfunctional Submit button.

---

## 10. Core answer-state management

This is the most important technical requirement of Phase 1A.

Use the existing TypeScript contracts and Zustand architecture where appropriate.

Design the exam state as explicit, testable transitions, separate from React rendering.

Distinguish three concepts:

**Visited state:** Whether the user has opened the question.

**Draft response:** The current unsaved choice in the question editor.

**Saved response:** The committed answer that the examination will eventually use for scoring.

Review flags are independent of answer selections.

### Required behavior

**Selecting an option**

Selecting an option changes the draft response but must not immediately commit the answer.

**Clicking a palette question**

Navigating through the palette must not automatically save the draft.

**Save & Next**

Commits the current selection and advances to the next permitted question.

**Mark for Review & Next**

Commits the current selection if present, marks the question for review, and advances.

**Marking without an answer**

Produces the "Marked for Review — Not Answered" palette status.

**Saved answer plus review mark**

Produces "Answered and Marked for Review".

**Returning to a saved question**

Restores the committed answer in the editor.

**Unsaved changes**

If the user changes a selection but navigates away without saving, discard those unsaved edits. Preserve the previously committed answer, if any.

**Clear Response**

Clears the active question's draft and saved response. Keep review-flag behavior independent and document whether an existing review mark remains until explicitly removed.

**Review-flag removal**

Allow the review mark to be removed without clearing the committed response.

**Cross-question isolation**

Changes to one question must not modify another question.

**Status derivation**

Derive the five question statuses from visited state, committed saved response, and review flag.

Do not store conflicting duplicate status values that can drift out of sync.

**Draft versus answered count**

An unsaved draft must not count as an answered question.

**Existing saved response**

Navigating away from an unsaved edit must not overwrite or erase an older committed response.

Write pure state transition functions or equivalent independently testable exam-domain logic.

Prefer stable question IDs rather than array indexes as persistent identifiers.

## 11. UI and accessibility requirements

Maintain the application's professional light design.

Prioritize practical examination usability.

Include:

- Readable typography
- Clear question hierarchy
- Visually distinct palette states
- Keyboard-accessible answer selection
- Visible keyboard focus
- Accessible section navigation
- Responsive layout
- Clear active-question indicators
- Appropriate disabled-button states
- No misleading exam functionality
- No unnecessary animations

Keep the exam screen distraction-free.

Do not use RBI branding, official logos, or visual elements that imply endorsement.

The goal is a credible practice experience, not an unsupported claim of pixel-perfect official exam reproduction.

## 12. Data and architecture requirements

Maintain separation between:

- Presentation components
- Exam state transitions
- Question repositories
- Validation schemas
- Demo question data
- Future verified-PYQ sources

Do not create a backend.

Do not implement cloud services or authentication.

Use the existing Zod question contracts as the source of truth.

Only extend existing types when required.

Maintain a clear extension path for:

- Configurable exam profiles
- Section timers
- Section locks
- Automatic submission
- Scoring
- Attempt persistence

Those capabilities are deferred and must not be claimed as implemented.

Do not modify `question-predictor` or introduce cross-repository dependencies.

## 13. Automated testing

Add comprehensive unit and React component tests.

At minimum, verify:

1. Dashboard demo entry works.
2. Instructions page renders all required information.
3. Begin Demo is disabled before agreement.
4. Starting a demo initializes a fresh session.
5. Exam URL without an active session is handled safely.
6. All four section tabs work.
7. Multiple questions can be navigated.
8. Visiting a question updates its visited state.
9. Selecting an option creates a draft response.
10. A draft answer does not count as answered.
11. Palette navigation does not save drafts.
12. Save & Next commits the selected response.
13. Mark for Review & Next commits and marks correctly.
14. Marking without an answer creates the correct status.
15. An answered question can also be marked for review.
16. Removing a review flag preserves the saved answer.
17. Returning to a question restores its saved response.
18. Navigating away discards unsaved changes.
19. Unsaved edits never overwrite an existing saved answer.
20. Clear Response clears the appropriate answer state.
21. Clearing one question does not change other questions.
22. All five palette statuses are derived correctly.
23. First and last question boundaries are safe.
24. Correct answers and explanations remain hidden.
25. The demo questions remain separate from verified PYQs.
26. Existing Phase 0 tests continue passing.
27. Disabled or unavailable features are not misleadingly interactive.

Prioritize meaningful state transition tests rather than superficial component-existence checks.

If browser automation is available, inspect the demo on desktop and mobile sizes.

Do not claim visual testing without actually performing it.

## 14. Explicitly out of scope

Do not implement any of the following in Phase 1A:

- Countdown timers
- Section timing or locking
- Refresh-safe deadline persistence
- Final examination submission
- Auto-submission
- Objective scoring
- Post-test result dashboards
- Completed mock history
- Real PYQ ingestion
- PDF extraction
- Phase II examination
- AI question generation
- Predictor integration
- Notion synchronization
- Authentication
- Backend/database services
- Deployment

Keep this milestone focused on a correct, maintainable exam interaction experience.

## 15. Mandatory documentation updates

Documentation maintenance is part of implementation, not an optional afterthought.

For this task, update the following repository files:

**`README.md`**

Explain how to run and test the application, the new demo entry point, implemented interactions, and limitations.

**`AGENTS.md`**

Preserve all existing instructions and explicitly retain the user-approved single-branch workflow. Update only if clarification is necessary; do not add duplicate conflicting instructions.

**`docs/PROJECT_CONTEXT.md`**

Record the actual Phase 1A implementation, current application structure, active branch, remaining tasks, and known limitations.

**`docs/ARCHITECTURE.md`**

Explain the exam-session state, question-navigation flow, presentation/domain separation, and the demo question boundary.

**`docs/DATA_CONTRACT.md`**

Document the demo-question data boundary and any actual schema changes. Preserve the verified-PYQ contract.

**`docs/ROADMAP.md`**

Mark Phase 1A complete only when it is implemented and verified.

Do not mark Phase 1B, Phase II, or other future phases as completed.

**`docs/DEVELOPMENT_LOG.md`**

Create a dated entry containing:

- Development prompt reference
- Git branch
- Features implemented
- Files changed
- Tests performed
- Actual test results
- Architecture decisions
- Unresolved issues
- Next recommended milestone
- Commit and push evidence once available

**`CHANGELOG.md`**

Add a concise summary of actual delivered capabilities.

**`docs/prompts/`**

Create a uniquely named, chronological Markdown file containing a sanitized copy of this Phase 1A prompt.

Do not include secrets, tokens, private information, or copyrighted examination papers.

If a document already exists, update it rather than creating a duplicate.

All documentation must describe the code that actually exists.

Do not describe planned features as completed.

Do not modify Notion study databases or write fabricated mock results.

## 16. Mandatory validation

Run all applicable existing project checks:

```bash
npm ci
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
```

Run formatting tools where needed and repeat validation after changes.

Fix failures introduced by this work.

Do not ignore failing tests.

Confirm the existing Phase 0 behavior remains functional.

If a check cannot be performed because the tool or environment is unavailable, record the exact limitation.

Do not invent successful test outcomes.

Check that no credentials, personal examination records, or restricted question papers are being committed.

## 17. GitHub synchronization — mandatory

Use the existing branch:

`feat/phase-0-foundation`

DO NOT CREATE NEW BRANCHES.

DO NOT CREATE NEW PULL REQUESTS.

DO NOT MERGE INTO MAIN.

Before committing:

1. Confirm the active branch.
2. Review the changed files.
3. Confirm the worktree has no unrelated modifications.
4. Run all applicable tests and validation.
5. Update documentation.
6. Archive the sanitized prompt.
7. Check the staged changes.

Then:

1. Commit source code, tests, and documentation together.
2. Use a descriptive commit message, such as `feat: implement Phase 1A exam interaction demo`.
3. Push to `origin/feat/phase-0-foundation`.
4. Verify the pushed commit exists on the remote.
5. Confirm existing PR #1 reflects the changes.
6. Inspect the new GitHub Actions CI run when available.
7. Report the exact CI state (passed, failed, pending, or unavailable).

Never claim the push succeeded without verification.

If GitHub authentication fails, keep the local commit intact and explain the exact problem.

If CI fails, inspect the logs and fix failures caused by this implementation. Do not merge failing changes.

Do not automatically merge PR #1 even if every check passes.

## 18. Completion report

After the work is finished, provide a structured completion report covering:

1. Summary of features implemented
2. Actual repository structure
3. New application routes
4. Number of original demo questions
5. Answer-state architecture
6. Implementation of the five palette statuses
7. Testing results
8. Linting and TypeScript results
9. Production build result
10. Browser visual QA result or limitation
11. Documentation files updated
12. Archived prompt location
13. Active branch
14. Commit SHA
15. GitHub push verification
16. Pull Request #1 status
17. GitHub Actions status
18. Remaining issues and limitations
19. Recommended next step for Phase 1B

If some acceptance criteria remain unfinished, report them accurately.

Do not mark the entire Phase 1 complete merely because Phase 1A is delivered.

## 19. Acceptance criteria

Phase 1A is complete only if:

- The application runs locally.
- The candidate can enter a clearly labeled Phase I demo.
- The instructions screen works.
- All four sections are accessible.
- Demo questions render correctly.
- Answer selection is functional.
- Save & Next commits correctly.
- Mark for Review & Next behaves correctly.
- Clear Response behaves correctly.
- Palette navigation does not save drafts.
- Revisiting questions preserves saved answers.
- Review marking is independently controllable.
- All five palette statuses are accurate.
- Answer keys remain hidden.
- Demo questions remain isolated from verified PYQs.
- Existing tests still pass.
- New meaningful tests pass.
- Documentation reflects the implemented code.
- The implementation is committed and pushed to the existing GitHub branch, or a precise blocker is reported.

**BEGIN IMPLEMENTATION NOW. DO NOT STOP AFTER WRITING A PLAN. DO NOT CREATE A NEW BRANCH. DO NOT MERGE INTO MAIN.**
