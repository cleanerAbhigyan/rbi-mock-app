import { z } from 'zod';
import { objectiveQuestionSchema } from '../../schemas/question';
import { runtimeDemoRecords } from './demo-questions';

// A separate key-validation boundary for synthetic practice ONLY. No catalog approval is granted.
const internalQuestionSchema = objectiveQuestionSchema.safeExtend({
  correctOptionId: z.string().min(1),
  explanation: z.string().trim().min(1),
  source: objectiveQuestionSchema.shape.source.safeExtend({
    category: z.literal('original-practice'),
  }),
});
export type DemoScoringRecord = z.infer<typeof internalQuestionSchema>;

export function createDemoScoringRepository(input: unknown) {
  const records = z.array(internalQuestionSchema).min(1).parse(input);
  if (new Set(records.map((record) => record.id)).size !== records.length)
    throw new Error('Duplicate scoring question ID.');
  return {
    listScoringRecords: (): readonly DemoScoringRecord[] =>
      structuredClone(records),
  };
}

export const demoScoringRepository =
  createDemoScoringRepository(runtimeDemoRecords);
