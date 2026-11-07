# Roadmap

Status definitions: **completed** means delivered and locally verified;
**planned** means no implementation claim. GitHub delivery and verification limits
are recorded in [Development log](DEVELOPMENT_LOG.md).

| Phase                                        | Status            | Scope                                                                                                                                                                                         |
| -------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — Project foundation & architecture        | Completed locally | Runnable shell/routes, honest empty catalog, schema/admission gates, synthetic fixtures, future engine types, tests/tooling/CI and current docs                                               |
| 1 — Phase I CBT demo                         | Planned — next    | Explicit synthetic demo mode, instructions, draft/saved responses, five palette states, save/clear/review/navigation, source-backed timers/locks, submission/scoring and Playwright E2E tests |
| 2 — Reviewed real-PYQ intake & exam profiles | Planned           | Human-reviewed provenance/answer keys/licensing, deduplication and catalog intake; versioned official-source profiles, 2027 only after notice                                                 |
| 3 — Local attempt continuity                 | Planned           | Versioned local persistence, refresh-safe deadlines/resume, question/profile snapshots and completed-attempt review                                                                           |
| 4 — Phase II                                 | Planned           | Objective/descriptive contract extension, writing editor and manual rubric; paper-specific verified profiles                                                                                  |
| 5 — Analysis and study workflow              | Planned           | Genuine completed-attempt analytics, mistake taxonomy and targeted practice; optional authorized export, no fabricated history                                                                |
| 6 — Independent predictor interchange        | Planned           | Agree versioned JSON envelope, review generated questions in separate practice catalog; no monorepo or direct runtime coupling                                                                |

## Phase 0 evidence and limits

Dashboard and question bank are implemented; exam options are disabled. There are
zero real PYQs, two isolated synthetic test fixtures and no mock attempts. Type
contracts do not implement engine behavior. Responsive CSS and keyboard/rendered
tests exist, but real desktop/mobile visual browser QA remains outstanding because
the available browser host could not be reached. No deployment was added.

## Next concrete task

Implement Phase I draft/saved response state transitions and derive all five palette
states with tests, using a clearly labeled synthetic demo bank behind its own
boundary. Start with a custom practice profile; add official timing assumptions
only with a reviewed matching handout. Keep solutions hidden until submission in
strict mode. Preserve this repo's empty real-PYQ catalog throughout demo development.
