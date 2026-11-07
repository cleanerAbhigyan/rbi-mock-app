# Roadmap

Status definitions: **completed** means delivered and locally verified;
**planned** makes no implementation claim. Evidence, commit/push results and
verification limits are in [Development log](DEVELOPMENT_LOG.md). Continue all work
on `feat/phase-0-foundation` / PR #1; do not merge without explicit user approval.

| Phase                                        | Status         | Scope                                                                                                                                                                                      |
| -------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 — Foundation & architecture                | Completed      | Runnable shell/routes, empty catalog, strict schema/admission, test fixtures, types, tooling/CI and docs                                                                                   |
| 1A — Candidate interface & answer management | Completed      | Instructions/agreement, guarded untimed/unscored demo, 12 original questions/four sections, drafts vs saved responses, navigation/save/review/clear, five derived palette states and tests |
| 1B — Timing, submission & scoring            | Planned — next | Profile-driven timers/section locks, refresh-safe deadlines, explicit/automatic submission, objective scoring and browser E2E coverage                                                     |
| 2 — Reviewed PYQs & official profiles        | Planned        | Human-reviewed provenance/keys/licensing, deduplication and catalog intake; official-source profiles, 2027 only after notice                                                               |
| 3 — Completed-attempt continuity             | Planned        | Versioned local completed history, immutable question/profile snapshots and post-test review                                                                                               |
| 4 — Phase II                                 | Planned        | Objective/descriptive schema extension, writing editor, manual rubric and verified paper profiles                                                                                          |
| 5 — Analysis & study workflow                | Planned        | Genuine completed-attempt analytics, mistakes and targeted practice; optional authorized export                                                                                            |
| 6 — Independent predictor interchange        | Planned        | Versioned JSON envelope, human approval and separate generated-practice catalog; no direct runtime coupling                                                                                |

## Current evidence and limits

Phase 0 behavior is retained. Phase 1A is a clearly labeled interaction demo, not a
complete Phase I exam: there is no timer, section lock, submission, scoring,
results or persistent history. The real verified-PYQ catalog is still empty. Twelve
runtime demo examples and two test-only fixtures remain separate. Reusing the
Begin Demo flow resets in-memory state; reload requires beginning again.

Unit/component tests cover the data and interaction boundaries, including all five
statuses and unsaved-answer isolation. The local server and route responses were
checked. Browser visual QA remains unavailable because the browser host could not
be reached; no desktop/mobile screenshot inspection is claimed. Phase 1 as a whole
is not complete. No deployment or Notion update was performed.

## Next concrete task

For Phase 1B, first specify profile-driven timer/section-lock transitions and a
refresh-safe deadline contract, then build submission and objective scoring over
committed responses only. Test answered-and-reviewed eligibility, timeout races,
refresh/resume and submission idempotency with browser E2E coverage when available.
Use a clearly labeled custom demo profile until matching official handouts have
been reviewed. Keep generated practice and developer samples out of the real PYQ
catalog and do not record fake completed results.
