# Roadmap

Status definitions: **completed** means delivered and locally verified;
**planned** makes no implementation claim. Evidence, commit/push results and
verification limits are in [Development log](DEVELOPMENT_LOG.md). Continue all work
on `feat/phase-0-foundation` / PR #1; do not merge without explicit user approval.

| Phase                                        | Status            | Scope                                                                                                                                                                                      |
| -------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 — Foundation & architecture                | Completed         | Runnable shell/routes, empty catalog, strict schema/admission, test fixtures, types, tooling/CI and docs                                                                                   |
| 1A — Candidate interface & answer management | Completed         | Instructions/agreement, guarded untimed/unscored demo, 12 original questions/four sections, drafts vs saved responses, navigation/save/review/clear, five derived palette states and tests |
| 1B — Timing, submission & scoring            | Completed locally | Absolute deadlines/locks, validated refresh recovery, idempotent submission, exact objective scoring and desktop/mobile browser coverage                                                   |
| 2 — Reviewed PYQs & official profiles        | Planned           | Human-reviewed provenance/keys/licensing, deduplication and catalog intake; official-source profiles, 2027 only after notice                                                               |
| 3 — Completed-attempt continuity             | Planned           | Versioned local completed history, immutable question/profile snapshots and post-test review                                                                                               |
| 4 — Phase II                                 | Planned           | Objective/descriptive schema extension, writing editor, manual rubric and verified paper profiles                                                                                          |
| 5 — Analysis & study workflow                | Planned           | Genuine completed-attempt analytics, mistakes and targeted practice; optional authorized export                                                                                            |
| 6 — Independent predictor interchange        | Planned           | Versioned JSON envelope, human approval and separate generated-practice catalog; no direct runtime coupling                                                                                |

## Current evidence and limits

Phases 0 and 1A remain intact. Phase 1B is separate custom timed/scored practice over
12 original demo questions: four sequential 60-second sections, absolute deadlines,
local refresh recovery, manual confirmation, automatic final submission, scored
results and post-submit solutions. The real verified-PYQ catalog is still empty.
This is not a complete official-source RBI examination simulator.

Unit/component/domain/store tests and desktop/mobile Chromium journeys cover
answer semantics, deadline/lock races, recovery, scoring and submission. Screenshots
were inspected. Only the latest active/completed timed record is retained; full
history, analytics, official profiles, Phase II and predictor work remain planned.
Clock/storage manipulation cannot be prevented by this local-only architecture.
No deployment or Notion update was performed.

## Next concrete task

Phase 2 should establish a source-reviewed exam-profile/import contract and a
human approval workflow for legally redistributable PYQs, with deduplication and
answer-key evidence. Do not fill the empty catalog with generated or reconstructed
historical claims. Use verified official handouts before introducing official
counts, scoring, section rules or any 2027 scheme. Completed-attempt history remains
a separate later milestone.
