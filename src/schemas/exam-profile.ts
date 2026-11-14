import { z } from 'zod';
import {
  auditId,
  citation,
  digest,
  exam,
  humanReviewer,
  phase,
  sourceYear,
} from './source-intake.ts';

const points = z
  .number()
  .finite()
  .nonnegative()
  .max(1_000_000)
  .refine(
    (n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-8,
    'Use at most two decimal places.',
  );
const marking = z
  .strictObject({ marks: points.refine((n) => n > 0), negativeMarks: points })
  .refine((m) => m.negativeMarks <= m.marks, 'Penalty cannot exceed marks.');
const officialUrl = z.url().refine((value) => {
  const url = new URL(value);
  return (
    url.protocol === 'https:' &&
    !url.username &&
    !url.password &&
    (url.hostname === 'rbi.org.in' || url.hostname.endsWith('.rbi.org.in'))
  );
}, 'Official reference needs an HTTPS RBI-domain document URL.');

const definedProfile = z
  .strictObject({
    schemaVersion: z.literal('1.0'),
    id: auditId,
    revision: z.number().int().positive(),
    exam,
    phase,
    year: sourceYear.nullable(),
    referenceLabel: citation,
    preparedBy: auditId,
    validFrom: z.iso.date().nullable(),
    validUntil: z.iso.date().nullable(),
    totalQuestionCount: z.number().int().positive(),
    timing: z.strictObject({
      mode: z.enum(['untimed', 'overall', 'sectioned']),
      totalDurationSeconds: z.number().int().positive().max(86400).nullable(),
    }),
    sections: z
      .array(
        z.strictObject({
          id: auditId,
          title: citation,
          order: z.number().int().positive(),
          questionCount: z.number().int().positive(),
          durationSeconds: z.number().int().positive().max(86400).nullable(),
          navigation: z.enum(['free', 'sequential-locked']),
        }),
      )
      .min(1),
    marking: z.strictObject({
      default: marking,
      sectionOverrides: z.array(
        z.strictObject({ sectionId: auditId, rule: marking }),
      ),
      questionOverrides: z.array(
        z.strictObject({
          questionId: auditId,
          sectionId: auditId,
          questionNumber: z.number().int().positive(),
          rule: marking,
        }),
      ),
    }),
  })
  .superRefine((profile, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: 'custom', message });
    const ids = new Set(profile.sections.map((s) => s.id));
    if (
      ids.size !== profile.sections.length ||
      profile.sections.some((s, i) => s.order !== i + 1)
    )
      issue(
        'Sections need unique IDs and contiguous declared order matching array order.',
      );
    if (
      profile.sections.reduce((sum, s) => sum + s.questionCount, 0) !==
      profile.totalQuestionCount
    )
      issue('Section question counts must sum to totalQuestionCount.');
    if (
      profile.validFrom &&
      profile.validUntil &&
      profile.validFrom > profile.validUntil
    )
      issue('Profile validity bounds are reversed.');
    if (profile.timing.mode === 'sectioned') {
      if (
        profile.sections.some(
          (s) =>
            s.durationSeconds === null || s.navigation !== 'sequential-locked',
        ) ||
        profile.sections.reduce(
          (sum, s) => sum + (s.durationSeconds ?? 0),
          0,
        ) !== profile.timing.totalDurationSeconds
      )
        issue(
          'Sectioned timing requires locked positive section durations summing to the total duration.',
        );
    } else {
      if (
        profile.sections.some(
          (s) => s.durationSeconds !== null || s.navigation !== 'free',
        )
      )
        issue(
          'Overall/untimed profiles use free navigation and no individual section duration.',
        );
      if (
        (profile.timing.mode === 'untimed') !==
        (profile.timing.totalDurationSeconds === null)
      )
        issue(
          'Untimed profiles require null total duration; overall timing requires a positive total.',
        );
    }
    if (
      new Set(profile.marking.sectionOverrides.map((o) => o.sectionId)).size !==
      profile.marking.sectionOverrides.length
    )
      issue('Duplicate section marking overrides.');
    if (
      new Set(profile.marking.questionOverrides.map((o) => o.questionId))
        .size !== profile.marking.questionOverrides.length ||
      new Set(
        profile.marking.questionOverrides.map((o) =>
          JSON.stringify([o.sectionId, o.questionNumber]),
        ),
      ).size !== profile.marking.questionOverrides.length
    )
      issue('Duplicate question marking overrides.');
    for (const override of profile.marking.sectionOverrides)
      if (!ids.has(override.sectionId))
        issue('Marking override references an unknown section.');
    for (const override of profile.marking.questionOverrides)
      if (
        !ids.has(override.sectionId) ||
        override.questionNumber >
          profile.sections.find((s) => s.id === override.sectionId)!
            .questionCount
      )
        issue('Question marking override is outside its section.');
  });

export const customReferenceProfileSchema = definedProfile.safeExtend({
  sourceStatus: z.literal('custom-practice'),
  sourceEvidence: z.null(),
});
export const verifiedReferenceProfileSchema = definedProfile.safeExtend({
  sourceStatus: z.literal('official-source-verified'),
  year: sourceYear,
  sourceEvidence: z.strictObject({
    sourceId: auditId,
    officialUrl,
    publisher: z.literal('Reserve Bank of India'),
    noticeDetails: citation,
    handoutDetails: citation,
    verificationNotes: citation,
    verifiedOn: z.iso.date(),
    reviewId: auditId,
    fieldCitations: z
      .array(z.strictObject({ field: citation, reference: citation }))
      .min(1),
  }),
});
export const pendingReferenceProfileSchema = z.strictObject({
  schemaVersion: z.literal('1.0'),
  id: auditId,
  revision: z.number().int().positive(),
  exam,
  phase,
  year: sourceYear,
  referenceLabel: citation,
  sourceStatus: z.literal('awaiting-source-verification'),
  pendingReason: z.enum([
    'awaiting-source-verification',
    'awaiting-official-notification',
  ]),
});
export const referenceProfileSchema = z.discriminatedUnion('sourceStatus', [
  customReferenceProfileSchema,
  verifiedReferenceProfileSchema,
  pendingReferenceProfileSchema,
]);

export const profileReviewSchema = z.strictObject({
  id: auditId,
  profileId: auditId,
  profileRevision: z.number().int().positive(),
  profileDigest: digest,
  sourceId: auditId,
  sourceDigest: digest,
  reviewer: humanReviewer,
  reviewedOn: z.iso.date(),
  decision: z.enum(['approved', 'rejected']),
  checkedFields: z.array(citation).min(1),
  evidenceNotes: citation,
  limitations: z.array(citation),
});

export type ReferenceProfile = z.infer<typeof referenceProfileSchema>;
export type VerifiedReferenceProfile = z.infer<
  typeof verifiedReferenceProfileSchema
>;
export type ProfileReview = z.infer<typeof profileReviewSchema>;
