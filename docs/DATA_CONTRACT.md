# Question data contract

## Implemented version 1.0

Runtime authority: `src/schemas/question.ts`. TypeScript question types are inferred
from Zod to prevent two drifting definitions. Only `kind: "objective"` is supported.
Unknown fields and unknown versions are rejected; descriptive records require a
future explicit version/variant, not an unvalidated text field on objective items.

| Field                           | Version 1.0 requirement                                                          |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `schemaVersion`                 | Literal `"1.0"`                                                                  |
| `kind`                          | Literal `"objective"`                                                            |
| `id`                            | Trimmed nonempty stable identifier; unique within a catalog                      |
| `revision`                      | Positive integer, increment when content/key/scoring changes                     |
| `exam`                          | Literal `"RBI Grade B (DR-General)"`                                             |
| `phase`                         | `phase-i` or `phase-ii`                                                          |
| `paperOrSection`                | Nonempty name; not an official profile declaration                               |
| `year`                          | Integer 1935–9999 or explicit null; required for actual catalog PYQs             |
| `text`                          | Nonempty question text                                                           |
| `options`                       | 2–10 `{ id, text }` objects; nonempty, distinct IDs and distinct text            |
| `correctOptionId`               | Existing option ID, or null while awaiting answer-key review                     |
| `explanation`                   | String; nonblank before scored admission                                         |
| `topic`, `subtopic`             | Nonempty names                                                                   |
| `marks`                         | Finite positive number, or null pending review                                   |
| `negativeMarks`                 | Finite nonnegative deduction, or null pending review; cannot exceed marks in 1.0 |
| `usage`                         | `catalog` or `developer-fixture`                                                 |
| `source.category`               | One of the five explicit categories below                                        |
| `source.reference`              | Nonempty original source citation, URL or permitted local-document reference     |
| `source.originalQuestionNumber` | Nonempty original question identifier, or null where inapplicable                |
| `source.answerKeyReference`     | Nonempty reviewed answer-key evidence reference, or null pending review          |
| `verificationStatus`            | `unverified`, `in-review`, `verified`, `rejected`                                |
| `approvalStatus`                | `pending`, `approved`, `rejected`                                                |

No filename, folder, year label or model output determines provenance. The flexible
year range is a structural format constraint, not evidence of an actual paper.
References are plain citations rather than automatically fetched URLs. Keep private
file paths and copyrighted source documents out of the public repository.

## Source categories

| Stored category               | Meaning                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `actual-pyq`                  | Claim of an original historical question; verified-PYQ label requires the stricter gate      |
| `memory-based-reconstruction` | Recalled/reconstructed text, never promoted to actual PYQ                                    |
| `coaching-reconstruction`     | Coaching-source reconstruction, never promoted to actual PYQ                                 |
| `original-practice`           | Original practice, including explicitly labeled code-authored synthetic development examples |
| `llm-generated-practice`      | Generated original practice; never a historical PYQ                                          |

`verified` means a reviewer has checked content, source classification, key and
scoring evidence. `approved` means a human has authorized inclusion after review,
including distribution permissions. These metadata assertions are a trust boundary:
schema validation cannot perform the human review or prove source authenticity.
Phase 2A adds a separate procedural review gate below; schema validity alone still
cannot grant approval. Changing content requires
a revision bump and renewed review/approval before release.

## Admission rules

1. `objectiveQuestionSchema` checks complete structural shape and option/scoring
   consistency. Review-stage records may explicitly have null key/scoring fields.
2. `scoredQuestionSchema` additionally requires catalog usage, verified status,
   approved status, a referenced correct option, answer-key reference, reviewed
   explanation and explicit marks/penalty (zero penalty is valid). This is an
   eligibility schema for future practice banks, not an implemented practice catalog.
3. `verifiedPyqSchema` additionally requires `actual-pyq`, non-null year and original
   question number. The inferred type is branded so callers receive it after parse.
4. The local repository validates the **entire** array, rejects duplicate question
   IDs (including two revisions of one ID), and throws on any failure. It neither
   drops failures nor rewrites statuses/categories. Returned snapshots are copied.
5. The live singleton additionally requires public source/review/provenance links.
   `npm run intake:check` recomputes exact reviewed content/source fingerprints.
   The structural repository factory remains usable in isolated contract tests;
   it is not an alternate importer or authorization mechanism.

The live `verified-pyqs.json` is still `[]`. The runtime demo is a separate dataset.
The two developer fixtures are original, explicitly synthetic and marked
`developer-fixture`; they fail scored and verified-PYQ admission even with approved
test metadata. Tests also construct synthetic metadata candidates to exercise the
gate; those are not real question records and never ship as catalog data.

## Phase 1A runtime demonstration boundary

The question schema remains **1.0 with no changes**; neither scored nor PYQ
admission was relaxed. `src/data/demo/demo-questions.ts` supplies 12 original,
code-authored synthetic interaction examples, three per Phase I section. These are
development content, not historical questions, human-reviewed keys, predictor
exports or an implemented generated-practice pipeline.

All demo records use `source.category: original-practice`, `year: null`,
`verificationStatus: unverified` and `approvalStatus: pending`, with an explicit
synthetic source citation and no original question number. Their existing
`usage: catalog` value means runtime content rather than developer fixtures; it
does not grant approval. They fail both scored and verified-PYQ admission.
Untimed demo weights (one mark, zero penalty) remain custom metadata and are not
scored in Phase 1A. The separate timed profile below configures its own weights;
neither set of values represents official RBI rules.

`createDemoQuestionRepository(unknown)` first applies a stricter extension of the
existing objective schema, requiring the demo metadata above and the four named
sections. It rejects duplicates, malformed batches and sets lacking multiple
questions in any section. It returns defensive copies through the separate
`DemoQuestionRepository.listDemoQuestions()` interface; it cannot add to
`QuestionRepository.listVerifiedPyqs()`.

Candidate projections include only ID/revision, section, text, options and demo
weights. Correct keys, explanations, provenance details and topic hints are
excluded from this presentation boundary. Original development records still ship
in client source/bundles: this is a personal-practice visibility boundary, not a
secrecy or anti-cheating guarantee.

`ExamSection.durationSeconds` now permits **null** to explicitly represent untimed
practice. The demo profile has no year, uses custom-practice source status and
free navigation. No official timing/profile or question-format migration was added.

## Future interchange boundary — proposal only, not an importer

The separate predictor repository may later export a JSON envelope containing:

- `contractVersion` identifying the package/import format independently of each
  question's `schemaVersion` and `revision`;
- producer name/version, export timestamp and stable package ID;
- records with stable IDs and explicit unchanged source category;
- original source and answer-key evidence, review/approval evidence and licensing;
- model/run IDs and generation provenance for generated practice, where applicable.

The exact envelope and descriptive variant remain unimplemented and must be agreed
and versioned before integration. Import must validate unknown input, reject
unsupported versions, detect duplicates/conflicts, preserve provenance, and require
human review before scored admission. Generated packages must enter a separate
practice catalog, never the verified-PYQ catalog. Test fixtures must remain separate.
Unknown source types must be rejected rather than coerced to historical PYQs.

No sibling source imports, shared runtime package, predictor API, JSON import UI,
CSV/PDF extraction or Notion synchronization is implemented. This document describes
the future boundary without promising those capabilities in Phase 1A.

## Phase 1B timed attempt contract 1.0

`schemas/timed-attempt.ts` is a new independent persistence contract; the question
schema 1.0 and all actual-PYQ/scored-catalog admission rules remain unchanged.
The storage key is `rbi-mock-app:timed-practice:v1`. Its one JSON record contains:

- Attempt ID/schema version and full profile ID/revision/source/section/marking snapshot.
- Candidate question snapshots: stable ID/revision, section, text/options and weights.
- Start time, last observed time, immutable cumulative section start/deadline schedule.
- Active section index, active question ID, unique visited IDs, saved responses
  (question ID/revision, option ID, ISO save timestamp) and independent review flags.
- Status (`in-progress` or `submitted`), nullable submission timestamp and reason
  (`manual` or `timeout`). There is no draft, answer key, explanation or result cache.

Restoration strictly validates shape/version, exact current profile/question snapshots,
original schedule, active index, visit/lock invariants, key membership and response
revision/option/time validity. Active records cannot claim submission metadata;
submitted records must have consistent timestamps/reasons. Reopening reconciles
against the original schedule, including final expiry. Unknown/stale/corrupt data
is never silently repaired or scored: the UI explains and offers explicit reset.
A restored editor always starts from its committed response; an unsaved selection
cannot become a saved or scored answer merely through refresh.

Only the latest record is retained. A completed result is derived on demand from
that submitted record and survives refresh; starting another completed mock replaces
it after acknowledgment. No unlimited local history or cloud synchronization exists.
Storage failures are visible. Use one active tab; this client-side format is neither
cryptographically authenticated nor a protection against deliberate clock/storage
manipulation. Do not export personal attempts into the public repository.

## Internal synthetic scoring boundary

The original runtime demonstration records remain `original-practice`, unverified,
pending, year-null, and excluded from `verifiedPyqSchema`/`scoredQuestionSchema`.
Phase 1B explicitly permits scoring these synthetic demonstrations through a
**separate** internal provider that validates keys/explanations and original source
category. That permission is not historical authenticity, human approval or catalog
admission. No predictor/generated-question integration was added.

The custom timed profile (`phase-i-custom-timed-v1`, revision 1) configures four
60-second sequential-locked sections, +1 for correct, −0.25 for incorrect and zero
for unanswered. Candidate projections carry these configured weights without keys.
The original untimed source data and zero-penalty metadata are unchanged. The scorer
uses each attempted question's snapshot weights; explicitly zero penalties are
supported. Up to two decimal places are validated, summed as integer hundredths,
then converted for display. Accuracy is correct/attempted × 100, rounded to two
decimal places, or 0 when none were attempted. Section totals reconcile with the
whole result. Saved-and-reviewed is attempted; review-only and drafts are not.

Key/content/scoring changes require revision bumps. Results are gated on actual
final submission, including when entering the results URL directly. Only then are
saved answer, correct answer, outcome and explanation projected to the review UI.
No official cutoffs, ranks, percentiles or qualification claims are computed.

## Phase 2A contracts — independent version 1.0

`schemas/source-intake.ts` defines strict Zod contracts; unknown fields/versions
fail. The objective question contract above remains unchanged. These versions are
independent of question revision, reference-profile revision and timed storage.

| Record             | Fields and rules                                                                                                                                                                                                                                                                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source document    | `schemaVersion`, stable `id`, `exam`, `phase`, nullable `year`, `paperOrSection`; `reference` is an HTTPS URL or lawful local citation; `documentType`, `publisher`, `attribution`, `documentDetails`, `originalDocumentReference`, `retrievedOn`, nullable `reviewedOn`; explicit `permission` metadata below                                                             |
| Candidate          | `sourceId`, exact `rawContent.{text,options}`, complete objective `question` (stable ID/revision, `usage: catalog`, **unverified/pending only**), nullable `answerKeyEvidenceReference` and `scoringEvidenceReference`, `extraction.{confidence,ambiguityNotes,notes}`                                                                                                     |
| Batch              | `importVersion: "1.0"`, stable `batchId`, `importedBy`, `createdOn`, nonempty `sources` and `candidates`; no embedded reviews or approved flags                                                                                                                                                                                                                            |
| Question review    | `id`, `batchId`, `questionId`, `questionRevision`, `sourceId`; `candidateDigest`, `questionDigest`, `sourceDigest`; `reviewer: {kind: human, id}`, `reviewedOn`, approved/rejected `decision`, `checkedCategory`, `evidence.{source,answerKey,scoring,rights}`, `rightsDecision`, `normalizationCorrections`, `resolvedAmbiguities`, `duplicateResolutions`, `limitations` |
| Catalog provenance | `questionId`, `questionRevision`, `sourceId`, `reviewId`, `batchId`, and the same three reviewed digests; exactly one per public question                                                                                                                                                                                                                                  |

Stable audit IDs start with a letter/digit and contain only letters/digits, `.`,
`:`, `_`, `-`. Dates use ISO calendar dates. Phase is I or II; year range 1935–9999
is only structural, not proof a paper existed. A staged null year/key/score is not
scored eligibility. Promotion requires the source-matching nonnull historical
year, source question number, complete key/explanation/weights and all evidence.

Source permission contains `status` (`unknown`, `restricted`,
`redistribution-permitted`), nullable dated `evidenceReference`/`reviewedOn`,
`publicMetadataAllowed`, and `documentPublishable`. Source and rights review cannot
precede retrieval. Public question promotion requires redistribution permission
for the question content and public metadata clearance. `documentPublishable` is
separate permission for the original document; it never causes a paper to be copied.
A publicly accessible URL alone grants no redistribution rights. Public metadata
must itself be sanitized and cleared; private paths/reviewer personal data and
restricted excerpts belong outside Git.

Batch validation rejects duplicate source IDs, question IDs (even different
revisions), duplicate `(sourceId, originalQuestionNumber)` pairs and inconsistent
source/reference/exam/phase/year/paper relationships. Source categories are never
coerced. Each candidate's raw text and ordered options must match the normalized
question after **CRLF/CR → LF and outer whitespace trimming only**. No punctuation,
Unicode, answer key, scoring or substantive text correction is inferred. Explanation
must already be trim-clean; substantive corrections require a new reviewed revision.
The raw content remains private in the staged record. Schema-level trimming also
applies to identifiers/citations as in the existing question contract.

The staged envelope is `{stageVersion: "1.0", state: "staged", batch, questions,
possibleDuplicates}`. Each `questions` entry records question ID, candidate and
question digests plus exact private `{field,before,after}` normalization changes.
Public review records acknowledge those changes as `{field,beforeDigest,afterDigest}`
to avoid publishing restricted source text in diffs. Digests are SHA-256 of
`JSON.stringify` of the parsed, normalized objects in contract field order. They
detect stale content; they are not signatures or semantic equivalence proofs.

Duplicate detection compares question-text token sets after NFKC, lowercase and
punctuation stripping **for detection only**. Identical sets, or Jaccard similarity
≥0.85 when each set has at least four tokens, flag candidates against each other
and the catalog. This heuristic can miss duplicates or flag distinct questions;
it never edits, merges or establishes authenticity. A human must supply an explicit
`distinct` decision with evidence for each flagged pair before promotion; true
duplicates must be removed/corrected in a new batch rather than approved as distinct.
Extraction ambiguity notes likewise need individual resolution and evidence.

Approval is exactly one human decision for the batch/ID/revision, with reviewer ID
different from `importedBy`; reviewer/source/content digests, category, key/scoring
references, rights evidence and chronology must agree. Only `actual-pyq` claims
from official/archived papers can pass this gate. Every question is validated
before any output is returned. No partially approved array is installed on failure.
Existing IDs/revisions and source/question-number collisions cannot be replaced by
promotion. An explicit separately reviewed migration is needed for replacements.

## Phase 2A local operator procedure

Run with Node 24; native TypeScript stripping and explicit `.ts` imports avoid
adding a runtime transpiler. The CLI uses fixed repository paths, never a browser,
scraper, source-document parser, arbitrary approval-file flag or sibling service.

1. Keep lawfully held raw documents and extracts under ignored `private-data/`
   (or elsewhere outside Git). Construct an `importVersion: "1.0"` batch using the
   schema above. There is deliberately no shipped purported historical sample.
2. `npm run intake -- validate INPUT.json` validates the complete batch and reports
   IDs/counts/duplicate flags without writing. `npm run intake -- stage INPUT.json`
   writes `private-data/intake/BATCH-ID.staged.json` atomically. Private directories
   and new files use owner-only modes. An existing different output is never
   overwritten; identical staging is idempotent. Invalid batches write nothing.
3. An independent human checks the original paper and references, lawful rights,
   category, key, weights, year/phase/number, extraction corrections and duplicates.
   Author sanitized source metadata in the fixed `src/data/source-review/sources.json`
   ledger and commit that reviewable metadata after clearance. It may be metadata-only
   even when the original document must stay private.
4. `npm run intake -- inspect private-data/intake/BATCH-ID.staged.json` recomputes
   staged content/correction bindings and prints candidate/question/source digests,
   correction proofs and duplicate flags, without printing question bodies. Inspection
   uses the source ledger at **HEAD**, so commit the cleared source metadata first.
   Fill `question-reviews.json` with the separate human decisions and the exact
   inspected digests. Commit those artifacts after human review; they are never
   created or approved automatically by an import command.
5. `npm run intake -- promote private-data/intake/BATCH-ID.staged.json` uses only
   `git show HEAD:src/data/source-review/...` fixed ledgers. It recomputes content,
   applies all gates, and atomically writes a private `BATCH-ID.approved.json` bundle
   containing `catalogVersion: "1.0"`, `reviewedAtCommit`, `questions` and `provenance`.
   This includes the existing catalog plus new records. It leaves the runtime bank
   and public ledgers untouched. Unknown/self-approved sources fail, as they do now.
6. Review the generated bundle and rights again. As an explicit repository edit,
   install its `questions` array in `src/data/question-bank/verified-pyqs.json` and
   its `provenance` array in `src/data/source-review/catalog-provenance.json` together.
   Run `npm run intake:check` and all required tests/build before committing/pushing
   the complete change. Never commit the staged/bundle/raw documents themselves.

`intake:check` reads working-tree public ledgers, validates all source/review/profile
shapes and unique IDs, rejects uncleared public metadata, requires traceability for
every public question, checks duplicate IDs/source-number pairs, and recomputes
question/source/profile hashes against review artifacts. The browser validates
linked structural evidence; Node/CI adds exact content binding. A malformed checked-in
catalog fails loading/checks; no records are silently filtered. Private staging is
not loaded in the app. Fixed paths and commit history are a procedural trust boundary,
not a defense against someone deliberately editing the repository or forging human
reviewer IDs. Human artifacts and hashes cannot establish historical authenticity
or legal permission. Do not use the synthetic test approvals as real evidence.

## Phase 2A independent reference profiles

`schemas/exam-profile.ts` and `features/profiles/registry.ts` define another strict
version-1.0 contract, independent of executable demo profiles and timed storage.
The empty `src/data/exam-profiles/profiles.json` registry is read through
`createReferenceProfileRegistry`; snapshots are defensive copies.

- Defined profiles have `id`, `revision`, exam/phase, nullable year for custom
  practice, `referenceLabel`, `preparedBy`, nullable `validFrom`/`validUntil`,
  `totalQuestionCount`, `timing`, ordered `sections`, and `marking`.
- `sections` have unique IDs, title, contiguous array-matching order, positive
  question count, nullable duration and `free`/`sequential-locked` navigation.
  Counts sum exactly. Sectioned timing requires locked positive durations summing
  to the total; overall timing has a positive total and no section durations;
  untimed has null durations. Overall/untimed navigation is free in version 1.0.
- Marks are positive and penalties nonnegative, at most two decimals, penalty ≤
  marks. `marking` has default weights, unique valid section overrides, and unique
  question-ID/section-number overrides within declared section counts. An eventual
  exam assembly must additionally match those IDs to its actual question bank.
- `custom-practice` requires null source evidence and never appears in `verified()`.
  `awaiting-source-verification` holds only identity/reference/pending reason, with
  no guessed sections or rules. Empty/missing 2027 references report
  `awaiting-official-notification`; other absent years await source verification.
- `official-source-verified` requires nonnull year, HTTPS RBI-domain URL without
  credentials, publisher `Reserve Bank of India`, source ID, notice/handout details,
  verification notes/date, review ID and field citations. Every declared exam,
  phase/year/validity, count, timing, navigation and marking fact needs a citation
  and matching checked-field entry in the independent human profile review.

To register a future official reference, cross-check all facts in an accessible
official notice/handout, document exact locators, add cleared matching metadata to
`sources.json`, and author the profile with `sourceEvidence`. Add a separate human
decision to `profile-reviews.json` (reviewer distinct from `preparedBy`) with
`profileDigest` and `sourceDigest` computed by the same `fingerprint` helper over
schema-parsed objects. The registry checks reviewed source ID/URL/publisher/year/phase,
dates and complete citations; `npm run intake:check` also recomputes both hashes.
Commit the profile and evidence together only after actual review. A label or URL
alone is insufficient. No official profile, source notice or pattern is added here;
the existing four custom 60-second sections remain separate and unchanged.

Future predictor interchange remains the **proposal only** above. This local intake
envelope is not an agreed predictor export format and adds no generated-practice
catalog or external integration.
