import { z } from 'zod';
import {
  profileReviewSchema,
  referenceProfileSchema,
} from '../../schemas/exam-profile.ts';
import type {
  ProfileReview,
  ReferenceProfile,
  VerifiedReferenceProfile,
} from '../../schemas/exam-profile.ts';
import { sourceDocumentSchema } from '../../schemas/source-intake.ts';
import type { SourceDocument } from '../../schemas/source-intake.ts';

/** Every asserted pattern value needs a locator, not just a link on the profile title. */
export function profileFactPaths(
  profile: Exclude<
    ReferenceProfile,
    { sourceStatus: 'awaiting-source-verification' }
  >,
) {
  return [
    'exam',
    'phase',
    'year',
    'validFrom',
    'validUntil',
    'totalQuestionCount',
    'timing.mode',
    'timing.totalDurationSeconds',
    'marking.default.marks',
    'marking.default.negativeMarks',
    ...profile.sections.flatMap((s) =>
      ['title', 'order', 'questionCount', 'durationSeconds', 'navigation'].map(
        (field) => `sections.${s.id}.${field}`,
      ),
    ),
    ...profile.marking.sectionOverrides.flatMap((o) =>
      ['marks', 'negativeMarks'].map(
        (field) => `marking.sections.${o.sectionId}.${field}`,
      ),
    ),
    ...profile.marking.questionOverrides.flatMap((o) =>
      ['sectionId', 'questionNumber', 'marks', 'negativeMarks'].map(
        (field) => `marking.questions.${o.questionId}.${field}`,
      ),
    ),
  ];
}

export function createReferenceProfileRegistry(
  input: unknown,
  evidence: { sources: SourceDocument[]; reviews: ProfileReview[] },
) {
  const profiles = z.array(referenceProfileSchema).parse(input);
  if (new Set(profiles.map((p) => p.id)).size !== profiles.length)
    throw new Error(
      'Duplicate profile IDs, including different revisions of the same ID.',
    );
  const sources = z.array(sourceDocumentSchema).parse(evidence.sources);
  const reviews = z.array(profileReviewSchema).parse(evidence.reviews);
  if (
    new Set(sources.map((s) => s.id)).size !== sources.length ||
    new Set(reviews.map((r) => r.id)).size !== reviews.length
  )
    throw new Error('Duplicate source/review IDs in profile registry.');
  for (const profile of profiles) {
    if (profile.sourceStatus !== 'official-source-verified') continue;
    const e = profile.sourceEvidence;
    const source = sources.find((s) => s.id === e.sourceId);
    const matches = reviews.filter(
      (r) =>
        r.profileId === profile.id && r.profileRevision === profile.revision,
    );
    const review = matches[0];
    if (
      matches.length !== 1 ||
      !review ||
      review.id !== e.reviewId ||
      review.decision !== 'approved' ||
      review.reviewer.kind !== 'human' ||
      review.reviewer.id === profile.preparedBy ||
      review.reviewedOn !== e.verifiedOn ||
      review.sourceId !== e.sourceId
    )
      throw new Error(
        `Profile ${profile.id}: independent human reference review is required.`,
      );
    if (
      !source ||
      source.reference.kind !== 'url' ||
      source.reference.url !== e.officialUrl ||
      source.publisher !== e.publisher ||
      !['official-notice', 'official-handout'].includes(source.documentType) ||
      source.phase !== profile.phase ||
      source.year !== profile.year ||
      !source.reviewedOn ||
      review.reviewedOn < source.reviewedOn ||
      !source.permission.publicMetadataAllowed
    )
      throw new Error(
        `Profile ${profile.id}: matching reviewed official source metadata is required.`,
      );
    const fields = profileFactPaths(profile);
    const cited = e.fieldCitations.map((c) => c.field);
    if (
      new Set(cited).size !== fields.length ||
      cited.length !== fields.length ||
      fields.some((field) => !cited.includes(field)) ||
      new Set(review.checkedFields).size !== fields.length ||
      review.checkedFields.length !== fields.length ||
      fields.some((field) => !review.checkedFields.includes(field))
    )
      throw new Error(
        `Profile ${profile.id}: every declared count, duration, navigation and scoring field needs checked source citations.`,
      );
  }
  return {
    list: (): readonly ReferenceProfile[] => structuredClone(profiles),
    verified: (): readonly VerifiedReferenceProfile[] =>
      structuredClone(
        profiles.filter((p) => p.sourceStatus === 'official-source-verified'),
      ),
    readiness: (year: number) =>
      profiles.some(
        (p) => p.year === year && p.sourceStatus === 'official-source-verified',
      )
        ? ('verified-reference' as const)
        : year === 2027
          ? ('awaiting-official-notification' as const)
          : ('awaiting-source-verification' as const),
  };
}
