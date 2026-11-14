import { fingerprint } from '../intake/pipeline.ts';
import { createReferenceProfileRegistry } from './registry.ts';
import type { ProfileReview } from '../../schemas/exam-profile.ts';
import type { SourceDocument } from '../../schemas/source-intake.ts';

export function checkReferenceProfiles(
  input: unknown,
  evidence: { sources: SourceDocument[]; reviews: ProfileReview[] },
) {
  const registry = createReferenceProfileRegistry(input, evidence);
  for (const profile of registry.verified()) {
    const review = evidence.reviews.find(
      (r) => r.id === profile.sourceEvidence.reviewId,
    )!;
    const source = evidence.sources.find(
      (s) => s.id === profile.sourceEvidence.sourceId,
    )!;
    if (
      review.profileDigest !== fingerprint(profile) ||
      review.sourceDigest !== fingerprint(source)
    )
      throw new Error(
        `Profile ${profile.id}: changed pattern or source requires independent re-review.`,
      );
  }
  return registry;
}
