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
No automated review/approval workflow exists in Phase 0. Changing content requires
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
