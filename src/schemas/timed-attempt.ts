import { z } from 'zod';

const id = z.string().min(1);
const time = z.number().int().nonnegative().max(8_640_000_000_000_000);
export const pointsSchema = z
  .number()
  .finite()
  .nonnegative()
  .max(1_000_000)
  .refine(
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8,
    'At most two decimal places are supported.',
  );

export const timedProfileSchema = z
  .strictObject({
    id,
    revision: z.number().int().positive(),
    label: id,
    exam: z.literal('RBI Grade B (DR-General)'),
    phase: z.literal('phase-i'),
    year: z.null(),
    source: z.strictObject({
      status: z.literal('custom-practice'),
      reference: id,
    }),
    sections: z
      .array(
        z.strictObject({
          id,
          title: id,
          questionIds: z.array(id).min(1),
          durationSeconds: z.number().int().positive().max(86400),
          navigation: z.literal('sequential-locked'),
        }),
      )
      .min(1),
    marking: z.strictObject({
      marks: pointsSchema.refine((n) => n > 0),
      negativeMarks: pointsSchema,
    }),
  })
  .superRefine((profile, ctx) => {
    const ids = profile.sections.flatMap((section) => section.questionIds);
    if (
      new Set(ids).size !== ids.length ||
      new Set(profile.sections.map((s) => s.id)).size !==
        profile.sections.length
    ) {
      ctx.addIssue({ code: 'custom', message: 'Profile IDs must be unique.' });
    }
    if (profile.marking.negativeMarks > profile.marking.marks)
      ctx.addIssue({ code: 'custom', message: 'Penalty exceeds marks.' });
  });

export const persistedTimedAttemptSchema = z.strictObject({
  schemaVersion: z.literal('1.0'),
  id,
  profileSnapshot: timedProfileSchema,
  questionSnapshots: z
    .array(
      z.strictObject({
        id,
        revision: z.number().int().positive(),
        sectionId: id,
        text: id,
        options: z.array(z.strictObject({ id, text: id })).min(2),
        marks: pointsSchema,
        negativeMarks: pointsSchema,
      }),
    )
    .min(1),
  startedAtMs: time,
  lastObservedAtMs: time,
  schedule: z
    .array(
      z.strictObject({ sectionId: id, startsAtMs: time, deadlineAtMs: time }),
    )
    .min(1),
  activeSectionIndex: z.number().int().nonnegative(),
  status: z.enum(['in-progress', 'submitted']),
  submittedAtMs: time.nullable(),
  submissionReason: z.enum(['manual', 'timeout']).nullable(),
  session: z.strictObject({
    profileId: id,
    activeQuestionId: id,
    visitedQuestionIds: z.array(id),
    savedResponses: z.record(
      id,
      z.strictObject({
        questionId: id,
        questionRevision: z.number().int().positive(),
        selectedOptionId: id,
        savedAt: z.iso.datetime(),
      }),
    ),
    reviewFlags: z.record(id, z.enum(['none', 'marked-for-review'])),
  }),
});

export type TimedProfile = z.infer<typeof timedProfileSchema>;
export type PersistedTimedAttempt = z.infer<typeof persistedTimedAttemptSchema>;
