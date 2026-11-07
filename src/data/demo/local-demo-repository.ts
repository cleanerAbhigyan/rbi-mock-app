import { z } from 'zod';
import { objectiveQuestionSchema } from '../../schemas/question';
import type { DemoQuestionRepository } from '../../features/questions/demo-question-repository';
import { demoSectionNames, runtimeDemoRecords } from './demo-questions';

const demoRecordSchema = objectiveQuestionSchema.safeExtend({
  phase: z.literal('phase-i'),
  year: z.null(),
  usage: z.literal('catalog'),
  paperOrSection: z.enum(demoSectionNames),
  verificationStatus: z.literal('unverified'),
  approvalStatus: z.literal('pending'),
  source: objectiveQuestionSchema.shape.source.safeExtend({
    category: z.literal('original-practice'),
    originalQuestionNumber: z.null(),
  }),
});

const demoSetSchema = z
  .array(demoRecordSchema)
  .superRefine((questions, ctx) => {
    if (
      new Set(questions.map((question) => question.id)).size !==
      questions.length
    ) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate demo question ID.' });
    }
    for (const section of demoSectionNames) {
      if (
        questions.filter((question) => question.paperOrSection === section)
          .length < 2
      ) {
        ctx.addIssue({
          code: 'custom',
          message: `Demo requires multiple questions in ${section}.`,
        });
      }
    }
  });

export function createDemoQuestionRepository(
  input: unknown,
): DemoQuestionRepository {
  const questions = demoSetSchema
    .parse(input)
    .map(
      ({
        id,
        revision,
        paperOrSection,
        text,
        options,
        marks,
        negativeMarks,
      }) => ({
        id,
        revision,
        paperOrSection,
        text,
        options,
        marks,
        negativeMarks,
      }),
    );
  return { listDemoQuestions: () => structuredClone(questions) };
}

export const localDemoRepository =
  createDemoQuestionRepository(runtimeDemoRecords);
