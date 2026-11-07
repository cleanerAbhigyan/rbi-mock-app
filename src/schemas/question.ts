import { z } from 'zod';

const nonEmptyText = z.string().trim().min(1);
const positiveScore = z.number().finite().positive();
const penalty = z.number().finite().nonnegative();
const sourceYear = z.number().int().min(1935).max(9999);

export const sourceCategorySchema = z.enum([
  'actual-pyq',
  'memory-based-reconstruction',
  'coaching-reconstruction',
  'original-practice',
  'llm-generated-practice',
]);

const questionSourceSchema = z.strictObject({
  category: sourceCategorySchema,
  reference: nonEmptyText,
  originalQuestionNumber: nonEmptyText.nullable(),
  answerKeyReference: nonEmptyText.nullable(),
});

const scoredSourceSchema = questionSourceSchema.safeExtend({
  answerKeyReference: nonEmptyText,
});

/** A record can be structurally valid while still awaiting review. */
export const objectiveQuestionSchema = z
  .strictObject({
    schemaVersion: z.literal('1.0'),
    kind: z.literal('objective'),
    id: nonEmptyText,
    revision: z.number().int().positive(),
    exam: z.literal('RBI Grade B (DR-General)'),
    phase: z.enum(['phase-i', 'phase-ii']),
    paperOrSection: nonEmptyText,
    year: sourceYear.nullable(),
    text: nonEmptyText,
    options: z
      .array(z.strictObject({ id: nonEmptyText, text: nonEmptyText }))
      .min(2)
      .max(10),
    correctOptionId: nonEmptyText.nullable(),
    explanation: z.string(),
    topic: nonEmptyText,
    subtopic: nonEmptyText,
    marks: positiveScore.nullable(),
    negativeMarks: penalty.nullable(),
    usage: z.enum(['catalog', 'developer-fixture']),
    source: questionSourceSchema,
    verificationStatus: z.enum([
      'unverified',
      'in-review',
      'verified',
      'rejected',
    ]),
    approvalStatus: z.enum(['pending', 'approved', 'rejected']),
  })
  .superRefine((question, ctx) => {
    const optionIds = question.options.map((option) => option.id);
    if (new Set(optionIds).size !== optionIds.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Option IDs must be unique.',
      });
    }
    if (
      new Set(question.options.map((option) => option.text)).size !==
      question.options.length
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Option texts must be distinct.',
      });
    }
    if (
      question.correctOptionId !== null &&
      !optionIds.includes(question.correctOptionId)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['correctOptionId'],
        message: 'Answer key must reference an option.',
      });
    }
    if (
      question.marks !== null &&
      question.negativeMarks !== null &&
      question.negativeMarks > question.marks
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['negativeMarks'],
        message: 'Penalty cannot exceed question marks in schema 1.0.',
      });
    }
  });

/** Shared eligibility for future scored practice banks; does not imply historical provenance. */
export const scoredQuestionSchema = objectiveQuestionSchema.safeExtend({
  usage: z.literal('catalog'),
  verificationStatus: z.literal('verified'),
  approvalStatus: z.literal('approved'),
  correctOptionId: nonEmptyText,
  source: scoredSourceSchema,
  explanation: nonEmptyText,
  marks: positiveScore,
  negativeMarks: penalty,
});

export const verifiedPyqSchema = scoredQuestionSchema
  .safeExtend({
    year: sourceYear,
    source: scoredSourceSchema.safeExtend({
      category: z.literal('actual-pyq'),
      originalQuestionNumber: nonEmptyText,
    }),
  })
  .brand<'VerifiedPyq'>();

export type ObjectiveQuestion = z.infer<typeof objectiveQuestionSchema>;
export type SourceCategory = z.infer<typeof sourceCategorySchema>;
export type ScoredQuestion = z.infer<typeof scoredQuestionSchema>;
export type VerifiedPyq = z.infer<typeof verifiedPyqSchema>;
