import { z } from 'zod';
import {
  catalogProvenanceSchema,
  questionReviewSchema,
  sourceDocumentSchema,
} from '../../schemas/source-intake.ts';
import { profileReviewSchema } from '../../schemas/exam-profile.ts';
import type { VerifiedPyq } from '../../schemas/question.ts';

export function parseEvidence(input: {
  sources: unknown;
  reviews: unknown;
  profileReviews: unknown;
  provenance: unknown;
}) {
  const result = {
    sources: z.array(sourceDocumentSchema).parse(input.sources),
    reviews: z.array(questionReviewSchema).parse(input.reviews),
    profileReviews: z.array(profileReviewSchema).parse(input.profileReviews),
    provenance: z.array(catalogProvenanceSchema).parse(input.provenance),
  };
  for (const [name, records] of Object.entries({
    sources: result.sources,
    reviews: result.reviews,
    profileReviews: result.profileReviews,
  })) {
    if (new Set(records.map((r) => r.id)).size !== records.length)
      throw new Error(`Duplicate ${name} IDs in trusted evidence registry.`);
  }
  return result;
}

/** Runtime link gate; content fingerprints are additionally enforced by the Node/CI check. */
export function assertCatalogTraceability(
  questions: readonly VerifiedPyq[],
  evidence: ReturnType<typeof parseEvidence>,
) {
  if (
    evidence.provenance.length !== questions.length ||
    new Set(evidence.provenance.map((p) => p.questionId)).size !==
      questions.length
  )
    throw new Error(
      'Approved catalog needs one unique provenance entry per question.',
    );
  for (const q of questions) {
    const trace = evidence.provenance.find(
      (p) => p.questionId === q.id && p.questionRevision === q.revision,
    );
    const source = evidence.sources.find((s) => s.id === trace?.sourceId);
    const review = evidence.reviews.find((r) => r.id === trace?.reviewId);
    if (
      !trace ||
      !source ||
      !review ||
      review.questionId !== q.id ||
      review.questionRevision !== q.revision ||
      review.sourceId !== source.id ||
      review.batchId !== trace.batchId ||
      review.decision !== 'approved' ||
      review.rightsDecision !== 'approved-for-public-catalog' ||
      review.checkedCategory !== 'actual-pyq' ||
      source.permission.status !== 'redistribution-permitted' ||
      !source.permission.publicMetadataAllowed ||
      !source.reviewedOn ||
      review.questionDigest !== trace.questionDigest ||
      review.candidateDigest !== trace.candidateDigest ||
      review.sourceDigest !== trace.sourceDigest
    )
      throw new Error(
        `Question ${q.id}: flags alone cannot establish reviewed catalog admission.`,
      );
  }
}
