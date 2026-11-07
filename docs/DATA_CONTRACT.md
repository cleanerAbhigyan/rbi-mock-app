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

| Stored category               | Meaning                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| `actual-pyq`                  | Claim of an original historical question; verified-PYQ label requires the stricter gate |
| `memory-based-reconstruction` | Recalled/reconstructed text, never promoted to actual PYQ                               |
| `coaching-reconstruction`     | Coaching-source reconstruction, never promoted to actual PYQ                            |
| `original-practice`           | Original human-authored practice, including explicitly separated test fixtures          |
| `llm-generated-practice`      | Generated original practice; never a historical PYQ                                     |

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

The live `verified-pyqs.json` is `[]`. It is the only current application dataset.
The two developer fixtures are original, explicitly synthetic and marked
`developer-fixture`; they fail scored and verified-PYQ admission even with approved
test metadata. Tests also construct synthetic metadata candidates to exercise the
gate; those are not real question records and never ship as catalog data.

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
the future boundary without promising those capabilities in version 0.1.0.
