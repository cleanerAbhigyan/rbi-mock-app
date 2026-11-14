# Phase 2A completion report

**Implementation date:** 2026-11-14 (America/Los_Angeles). The filename retains the
2026-11-07 date explicitly required by the original task.
**Status:** Implemented and locally validated; GitHub delivery verification pending.
**Branch:** existing `Feature`; no new branch, PR or merge.
**Task:** [Archived implementation prompt](../prompts/2026-11-07-phase-2a-pyq-intake-and-profile-foundation.md).
**Log:** [Phase 2A](../DEVELOPMENT_LOG.md#phase-2a--2026-11-14).

## Delivered

- Strict source-manifest, candidate, versioned import-batch, independent human
  review and catalog-provenance schemas. Existing question schema 1.0 is unchanged.
- Atomic local JSON validation/staging, whitespace-only normalization with raw
  retention and reviewed correction fingerprints, duplicate flags without merging,
  and explicit ambiguity resolution before promotion.
- Promotion requires fixed committed source/review artifacts, independent reviewer,
  matching content/source/key/scoring/rights evidence and complete historical data.
  Supplied verified flags or arbitrary review files cannot grant approval.
- Generated approved output is a private bundle with both catalog/provenance arrays
  and the review commit. The CLI never installs live catalog data. Explicit reviewed
  installation plus `intake:check` prevents silent partial public imports.
- Live catalog loader checks linked public evidence; Node/CI also recomputes hashes
  and rejects stale content, duplicate public IDs/source numbers and missing traces.
- Independent reference-profile registry supports custom/pending/official-verified
  contracts, citations for every declared pattern fact, independent review, section
  order/counts/timing/navigation, marking overrides and validity bounds.
- Existing `/question-bank` adds read-only counts, pending-year/source status and
  operator instructions. There is no browser importer or privileged promotion API.
- All old routes, 12 original runtime questions, untimed interactions, custom
  60-second sections, draft/save semantics, timing/recovery/submission/scoring remain.

## Actual data state

| Dataset                                                | Count / state                                 |
| ------------------------------------------------------ | --------------------------------------------- |
| Approved real PYQs                                     | **0**, `verified-pyqs.json` remains `[]`      |
| Public source manifests                                | **0**                                         |
| Approved human question reviews                        | **0**                                         |
| Public provenance entries                              | **0**                                         |
| Official profile reviews / verified reference profiles | **0 / 0**                                     |
| Runtime original demonstration questions               | **12**, unchanged and separate                |
| 2027 examination pattern                               | Awaiting official notification                |
| Historical reference patterns                          | Awaiting source verification; none registered |

No real papers, restricted extracts, fake historical records, model questions or
purported official sample profiles were imported. Synthetic positive approval and
official-profile examples exist only under `tests/fixtures`, clearly labeled as
contract tests, and never enter runtime registries. No official handout/paper
values were cross-checked in this task. All three Notion product links were read
as context; no Notion pages or study trackers were modified.

## Operator workflow and design

Run with Node 24 and npm:

```sh
npm ci
npm run dev
npm run intake -- validate INPUT.json
npm run intake -- stage INPUT.json
npm run intake -- inspect private-data/intake/BATCH-ID.staged.json
# Independent human review; commit sanitized fixed-path source/review artifacts.
npm run intake -- promote private-data/intake/BATCH-ID.staged.json
npm run intake:check
```

Staged records and generated bundles stay under ignored `private-data/intake/`;
private files are owner-only and different existing output is not overwritten.
Source metadata must be committed before inspection, and source/review artifacts
must be committed before promotion. The CLI reads those fixed paths at HEAD,
never an import-supplied approval file. Review IDs and exact revision/source/content
digests are auditable. Public correction acknowledgments use fingerprints rather
than copying raw restricted text. Installation requires reviewing and copying both
bundle arrays to the documented catalog/provenance files, then passing checks and
committing the full change. Profile registration is also a reviewed repository edit.

Full contract fields, rights distinctions, duplicate heuristic, profile citations,
registration and failure behavior: [DATA_CONTRACT](../DATA_CONTRACT.md#phase-2a-local-operator-procedure).
Module/data flow: [ARCHITECTURE](../ARCHITECTURE.md#phase-2a-intake-and-review-boundaries).

## Changed files

- Contracts: `src/schemas/source-intake.ts`, `src/schemas/exam-profile.ts`.
- Intake: `src/features/intake/pipeline.ts`, `evidence.ts`; `scripts/intake.ts`.
- Profiles: `src/features/profiles/registry.ts`, `check.ts`.
- Public data: empty `src/data/source-review/{sources,question-reviews,profile-reviews,catalog-provenance}.json`,
  browser-safe `readiness.ts`, empty `src/data/exam-profiles/profiles.json`.
- Runtime: `src/data/question-bank/local-question-repository.ts`,
  `src/features/questions/QuestionBankPage.tsx`, `src/styles/index.css`.
- Tests: `tests/{intake,intake-cli,profiles}.test.ts`, `tests/readiness.test.tsx`,
  synthetic `tests/fixtures/intake.ts`, `e2e/source-readiness.spec.ts`.
- Tooling: `package.json` scripts, `tsconfig.json` native-TS/CLI checking,
  `.github/workflows/ci.yml` registry check. No dependency or lockfile change.
- Docs: README, AGENTS, PROJECT_CONTEXT, ARCHITECTURE, DATA_CONTRACT, ROADMAP,
  DEVELOPMENT_LOG, CHANGELOG, CODEX_NEXT_TASK, CODEX_LATEST_REPORT and this report.
  The existing sanitized prompt is reused without duplicating or rewriting it.

## Local validation evidence

Node **24.22.3 LTS**, temporary runtime outside the repository; Chromium was already
installed in the host cache. No binaries or generated browser artifacts are committed.

| Command / check                           | Actual outcome                                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                                  | Passed; 248 packages, audit reported 0 vulnerabilities                                                                                            |
| `npm run lint`                            | Passed, zero warnings                                                                                                                             |
| `npm run typecheck`                       | Passed, including CLI and all tests                                                                                                               |
| `npm run format` / `npm run format:check` | Applied and passed, including final handoff documents                                                                                             |
| `npm test`                                | **175 passed in 12 files**; all 126 existing tests retained, 49 added                                                                             |
| `npm run intake:check`                    | Passed; all public counts 0, 2027 awaiting official notification                                                                                  |
| `npm run build`                           | Passed; 167 modules, JS 420.37 kB (127.11 kB gzip), CSS 23.97 kB (6.30 kB gzip)                                                                   |
| `npm run test:e2e`                        | **10 passed**: 5 journeys × desktop and mobile Chromium; all prior 8 journeys retained                                                            |
| Browser QA                                | Vite launched via Playwright; inspected new desktop and mobile screenshots, readable counts and wrapped instructions, no horizontal page overflow |
| Scope / secrets / `git diff --check`      | Passed; scoped credential-pattern scan, ignored-material boundary and production bundle isolation checks passed                                   |

Coverage includes invalid source/batch identity/version/citations/options, duplicate
IDs/source numbers, all five categories, unchanged raw/staged state, required
independent review, stale content/source binding, rights/key/scoring/year/number
omissions, unresolved ambiguities/duplicates, atomic rejection, public traceability,
custom vs verified profile rules, invalid ordering/time/counts/overrides and truthful
empty runtime readiness. CLI tests execute actual Node commands and verify no public
catalog mutation after failed promotion. Initial CLI test execution hit a sandbox
child-process restriction; rerunning with execution permission passed. The test
harness now fails explicitly on child-process errors rather than masking them.

Browser evidence files are ignored `test-results/source-readiness-*/source-readiness.png`;
existing timed screenshots/journeys were also produced. Verification is Chromium
desktop/mobile only, not Firefox/WebKit or a manual screen-reader audit.

## Limits and outstanding work

Human artifacts are procedural, not cryptographic proof of authenticity, rights or
reviewer identity. Hashes detect reviewed-content changes, not forged claims by
someone editing the repository. Duplicate detection is a conservative text-token
heuristic, not comprehensive semantic deduplication. Paper rights and metadata
publication rights still require actual human review. No real data was available
for human approval, so no genuine promotion or official registration was claimed.

The reference loader does not assemble or execute official exams; a future assembly
step must bind profile question overrides to an adequate matching question bank.
No scraping/OCR/editor, full history, Phase II, predictor coupling, cloud/auth,
deployment, Notion sync or main merge was added. Existing local clock/storage and
single-active-tab limitations still apply.

Recommended future work, **not selected or implemented**: a small legally
redistributable historical intake with independent source/key/scoring/rights review,
plus an accessible official handout checked fact-by-fact. Await user instructions.

## GitHub delivery

Initial state was clean `Feature`, safely fetched and fast-forward checked against
`origin/Feature` before coding. Implementation commit, remote SHA and Actions are
**pending** until the commit/push is performed. A follow-up evidence entry will link
the verified implementation commit and CI result without self-referential SHA loops.
No new branch or PR will be created and no merge into `main` is authorized.
