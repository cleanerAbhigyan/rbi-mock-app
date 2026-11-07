# Implementation prompt — Phase 0: Project Foundation & Architecture

Recorded 2026-11-06 (America/Los_Angeles). Sanitized task copy; no credentials,
private mock histories, or copyrighted question content were supplied.

Act as senior software engineer, frontend architect, test engineer, and GitHub
development assistant. Implement and verify a working Phase 0 foundation for the
RBI Grade B Mock Exam Simulator in the currently opened `rbi-mock-app` workspace.
Do not stop at planning or pseudocode.

## Identity and context

- Existing repository: https://github.com/cleanerAbhigyan/rbi-mock-app.
- This is independent of `question-predictor`. Do not create a monorepo, nested
  repository, sibling project, shared workspace, or cross-repository dependency.
- Before coding, inspect files, AGENTS.md, README.md, PROJECT_CONTEXT.md and other
  existing documentation. Inspect Git status, branch, remotes, and local/remote
  history. Preserve existing planning and uncommitted work. Fast-forward when safe;
  never discard changes or force-push.
- Read these Notion references if available; otherwise use the prompt and repo:
  - Product specification: https://app.notion.com/p/410504b1d5b68152b201dc8f784e3468
  - RBI project: https://app.notion.com/p/3ff504b1d5b680eeb770c3395de0fdde
  - PYQ analysis: https://app.notion.com/p/410504b1d5b68125a29fc8d2317e66a0
- GitHub is authoritative for actual implementation; Notion for intended product
  requirements. Do not modify study trackers or create duplicate Notion pages.

## Stack and architecture

Use React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, Zod, Vitest,
React Testing Library, ESLint and Prettier. Use Node LTS and maintained compatible
versions. Use npm and commit package-lock.json unless a different package manager
already exists. Keep the app local-first with no unnecessary backend. Introduce
Playwright only when implementing the exam experience.

Organize by responsibility: `src/app/{App.tsx,router.tsx}`, `components/{layout,ui}`,
`features/{exam,questions,results}`, `data/{fixtures,question-bank}`, `schemas`,
`stores`, `types`, `lib`, `styles`, `main.tsx`; `tests`, `docs/prompts`,
`.github/workflows`, AGENTS.md, README.md, CHANGELOG.md, package.json, .gitignore.
Adapt where technically necessary. Do not add empty files, unnecessary abstractions
or placeholder services just to fill the tree.

## Phase 0 UI

Build a polished, professional light-mode, responsive desktop-first dashboard with
simple working navigation. Name it “RBI Grade B Mock Exam Simulator” and describe
it as “Independent computer-based examination practice application”. Clearly state
that it is not official RBI or IBPS software and imply no affiliation.

Show three planned, unimplemented and disabled exam options:

1. RBI Grade B — Phase I
2. RBI Grade B — Phase II
3. Sectional Practice

Show the actual verified-PYQ count. If no approved records exist, display exactly:
“No verified PYQs imported yet.” Do not populate the catalog with invented
historical questions. Display “RBI Grade B 2027 examination pattern awaiting
official notification.” Do not hardcode unverified 2027 rules. The dashboard must
run and navigate; no decorative controls that look functional but do nothing.

## Question data

Create a typed, versioned TypeScript/Zod objective-question schema extensible to
descriptive questions later. Include unique ID, schema version, exam name, phase,
paper/section, applicable year, text, options, correct answer, explanation, topic,
subtopic, marks, negative marking, source category, original source reference,
original question number, verification status, approval status, and revision.

Keep these categories distinct: actual verified PYQ, memory-based reconstruction,
coaching reconstruction, original practice, and LLM-generated practice. Provenance
must be explicit; filenames, year labels and folder locations never imply verified
PYQs. Only valid source status, answer keys and scoring permit scored-bank entry.

Create a simple question repository/loader interface and local validated loader;
the simulator consumes validated records only through this boundary. Keep the real
PYQ catalog empty unless genuine verified records already exist. Keep a few
original synthetic developer fixtures separate for tests and future demo mode;
never count them as PYQs. Generated-question integration is unimplemented; document
a future versioned JSON import boundary with no direct predictor integration.
Test that invalid, incomplete, unverified or unapproved records cannot silently
enter the approved scored catalog.

## Future engine contracts

Define strong types for ExamProfile, ExamSection, ExamAttempt, SavedResponse,
QuestionStatus, ReviewFlag, ExamResult. Define all five palette states: not visited,
not answered, answered, marked for review without answer, answered and marked for
review. Document unsaved draft choices versus committed saved responses. Do not
implement timer, navigation, scoring or other full engine behavior in Phase 0.

## Validation and CI

Test shell rendering, intended routes, honest disabled capabilities, empty bank,
valid sample records, invalid records, unapproved-bank rejection and preservation
of source categories. Provide dev, build, lint, typecheck and test npm scripts.
Run applicable checks and fix errors. Add CI on pushes and PRs: dependency install,
lint, types, unit tests and production build. Use maintained GitHub Actions with
minimal permissions. Do not commit or print secrets; add no deployment.

## Documentation and GitHub delivery

Update README (purpose, stack, architecture, installation, commands, implemented
and planned features), preserve and minimally extend AGENTS.md, update
PROJECT_CONTEXT (structure, actual features, deferred work, decisions, references,
next milestone), ARCHITECTURE (modules, data flow, source/predictor separation),
DATA_CONTRACT (schema, validation, provenance/approval, future exchange), ROADMAP
(Phase 0 onward with truthful statuses), DEVELOPMENT_LOG (date, task, changed files,
actual checks, decisions, blockers, commit reference), CHANGELOG, and this sanitized
prompt history. Do not record future capabilities as complete.

Review scope and secrets; run tests, lint, types and build; stage code, tests,
documentation and prompt together; create a descriptive commit on a dedicated
feature branch; push to existing origin without force; create a PR if appropriate.
Do not merge into main. If synchronization fails, keep the commit and report the
precise blocker. Never claim a push without verifying it.

## Out of scope

Full timed exams, question palette interactions, Save & Next, review marking,
submission/scoring, Phase II descriptive exams, PDF extraction, real PYQ collection
or scraping, prediction, predictor integration, Notion API synchronization,
authentication, cloud databases and deployment.

## Completion and final report

Phase 0 requires a launching Vite app, responsive accessible dashboard/navigation,
working schema/validation, honest empty catalog, isolated fixtures, passing tests,
lint/types/build, accurate documentation, and committed/pushed changes (or a
specific reported GitHub blocker).

Report repository structure, actual features, launch commands, tests/build results,
branch, commit SHA, push result, documentation changes, outstanding issues and the
recommended Phase 1 task. Start with workspace inspection, then implement, verify,
document and synchronize verified changes.
