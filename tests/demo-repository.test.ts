import { describe, expect, it } from 'vitest';
import {
  runtimeDemoRecords,
  demoSectionNames,
} from '../src/data/demo/demo-questions';
import {
  createDemoQuestionRepository,
  localDemoRepository,
} from '../src/data/demo/local-demo-repository';
import {
  createLocalQuestionRepository,
  localQuestionRepository,
} from '../src/data/question-bank/local-question-repository';
import {
  objectiveQuestionSchema,
  scoredQuestionSchema,
  verifiedPyqSchema,
} from '../src/schemas/question';
import { developerQuestions } from '../src/data/fixtures/objective-questions';
import { demoProfile, demoQuestions } from '../src/features/exam/demo-profile';

describe('runtime demonstration boundary', () => {
  it('uses a custom untimed profile whose section order matches question navigation', () => {
    expect(demoProfile.source.status).toBe('custom-practice');
    expect(demoProfile.year).toBeNull();
    expect(demoProfile.sections.map((section) => section.title)).toEqual([
      ...demoSectionNames,
    ]);
    expect(
      demoProfile.sections.every(
        (section) =>
          section.durationSeconds === null && section.navigation === 'free',
      ),
    ).toBe(true);
    expect(
      demoProfile.sections.flatMap((section) => section.questionIds),
    ).toEqual(demoQuestions.map((question) => question.id));
  });
  it('validates 12 separate original demonstration records with three questions in each section', () => {
    expect(runtimeDemoRecords).toHaveLength(12);
    for (const record of runtimeDemoRecords) {
      expect(objectiveQuestionSchema.safeParse(record).success).toBe(true);
      expect(record.source.category).toBe('original-practice');
      expect(record.verificationStatus).toBe('unverified');
      expect(record.approvalStatus).toBe('pending');
      expect(record.source.reference).toContain('NOT ACTUAL RBI PYQs');
      expect(record.year).toBeNull();
      expect(scoredQuestionSchema.safeParse(record).success).toBe(false);
      expect(verifiedPyqSchema.safeParse(record).success).toBe(false);
    }
    for (const section of demoSectionNames)
      expect(
        runtimeDemoRecords.filter((q) => q.paperOrSection === section),
      ).toHaveLength(3);
    expect(
      runtimeDemoRecords.every(
        (q) => !developerQuestions.some((fixture) => fixture.id === q.id),
      ),
    ).toBe(true);
    expect(localQuestionRepository.listVerifiedPyqs()).toEqual([]);
    expect(() => createLocalQuestionRepository(runtimeDemoRecords)).toThrow();
  });

  it('returns candidate data without answer keys, explanations or topic hints', () => {
    const questions = localDemoRepository.listDemoQuestions();
    expect(questions).toHaveLength(12);
    for (const question of questions) {
      expect(question).not.toHaveProperty('correctOptionId');
      expect(question).not.toHaveProperty('explanation');
      expect(question).not.toHaveProperty('topic');
    }
  });

  it('rejects invalid mixed batches, duplicates, missing sections and wrong provenance', () => {
    const records = structuredClone(runtimeDemoRecords);
    expect(() => createDemoQuestionRepository([])).toThrow();
    expect(() => createDemoQuestionRepository(developerQuestions)).toThrow();
    expect(() =>
      createDemoQuestionRepository([...records, records[0]]),
    ).toThrow(/Duplicate demo/);
    expect(() =>
      createDemoQuestionRepository(
        records.filter((q) => q.paperOrSection !== 'English Language'),
      ),
    ).toThrow();
    for (const patch of [
      { text: '' },
      { year: 2025 },
      { verificationStatus: 'verified' },
      { source: { ...records[0]!.source, category: 'actual-pyq' } },
      { source: { ...records[0]!.source, category: 'llm-generated-practice' } },
    ])
      expect(() =>
        createDemoQuestionRepository([
          { ...records[0], ...patch },
          ...records.slice(1),
        ]),
      ).toThrow();
  });

  it('protects provider snapshots from input and consumer mutation', () => {
    const records = structuredClone(runtimeDemoRecords);
    const repository = createDemoQuestionRepository(records);
    records[0]!.text = 'changed';
    const questions = repository.listDemoQuestions();
    questions[0]!.options[0]!.text = 'changed option';
    expect(repository.listDemoQuestions()[0]!.text).not.toBe('changed');
    expect(repository.listDemoQuestions()[0]!.options[0]!.text).not.toBe(
      'changed option',
    );
  });
});
