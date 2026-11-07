import { describe, expect, it } from 'vitest';
import { developerQuestions } from '../src/data/fixtures/objective-questions';
import {
  createLocalQuestionRepository,
  localQuestionRepository,
} from '../src/data/question-bank/local-question-repository';
import {
  objectiveQuestionSchema,
  scoredQuestionSchema,
  sourceCategorySchema,
  verifiedPyqSchema,
} from '../src/schemas/question';

function fixture() {
  return structuredClone(developerQuestions[0]!);
}

/** Synthetic contract test only: these metadata values do not assert historical authenticity. */
function catalogCandidate() {
  const question = fixture();
  return {
    ...question,
    id: 'synthetic-contract-validation-only',
    usage: 'catalog' as const,
    year: 2000,
    source: {
      ...question.source,
      category: 'actual-pyq' as const,
      reference:
        'SYNTHETIC SCHEMA TEST ONLY: not a real source or historical question.',
      originalQuestionNumber: 'synthetic-validation-only',
    },
  };
}

describe('objective schema 1.0', () => {
  it.each(developerQuestions)(
    'accepts the original synthetic fixture $id',
    (question) => {
      expect(objectiveQuestionSchema.safeParse(question).success).toBe(true);
    },
  );

  it.each([
    ['schemaVersion', '2.0'],
    ['kind', 'descriptive'],
    ['id', ' '],
    ['revision', 0],
    ['text', ''],
    ['marks', 0],
    ['marks', -1],
    ['marks', Infinity],
    ['negativeMarks', -0.25],
    ['negativeMarks', 2],
    ['correctOptionId', 'missing'],
    ['phase', 'phase-iii'],
    ['year', 2026.5],
    ['options', []],
  ])('rejects invalid %s = %s', (field, value) => {
    expect(
      objectiveQuestionSchema.safeParse({ ...fixture(), [field]: value })
        .success,
    ).toBe(false);
  });

  it('rejects incomplete, unknown and duplicate option data', () => {
    const { source: omittedSource, ...missingSource } = fixture();
    expect(omittedSource).toBeDefined();
    expect(objectiveQuestionSchema.safeParse(missingSource).success).toBe(
      false,
    );
    expect(
      objectiveQuestionSchema.safeParse({ ...fixture(), inferredPyq: true })
        .success,
    ).toBe(false);
    expect(
      objectiveQuestionSchema.safeParse({
        ...fixture(),
        options: [
          { id: 'a', text: 'One' },
          { id: 'a', text: 'Two' },
        ],
      }).success,
    ).toBe(false);
    expect(
      objectiveQuestionSchema.safeParse({
        ...fixture(),
        options: [
          { id: 'a', text: 'Same' },
          { id: 'b', text: 'Same' },
        ],
      }).success,
    ).toBe(false);
    expect(
      objectiveQuestionSchema.safeParse({
        ...fixture(),
        source: { ...fixture().source, reference: ' ' },
      }).success,
    ).toBe(false);
  });

  it('permits explicit review-stage nulls without granting scored eligibility', () => {
    const draft = {
      ...catalogCandidate(),
      correctOptionId: null,
      marks: null,
      negativeMarks: null,
      explanation: '',
      verificationStatus: 'unverified',
      approvalStatus: 'pending',
    };
    expect(objectiveQuestionSchema.safeParse(draft).success).toBe(true);
    expect(scoredQuestionSchema.safeParse(draft).success).toBe(false);
  });

  it.each(sourceCategorySchema.options)(
    'preserves source category %s exactly',
    (category) => {
      const question = {
        ...fixture(),
        source: { ...fixture().source, category },
      };
      expect(objectiveQuestionSchema.parse(question).source.category).toBe(
        category,
      );
    },
  );
});

describe('scored and verified-PYQ admission boundaries', () => {
  it('accepts a fully populated synthetic contract candidate and explicit zero penalty', () => {
    expect(verifiedPyqSchema.safeParse(catalogCandidate()).success).toBe(true);
    expect(
      createLocalQuestionRepository([catalogCandidate()]).listVerifiedPyqs(),
    ).toHaveLength(1);
  });

  it.each([
    ['verificationStatus', 'unverified'],
    ['verificationStatus', 'in-review'],
    ['verificationStatus', 'rejected'],
    ['approvalStatus', 'pending'],
    ['approvalStatus', 'rejected'],
    ['usage', 'developer-fixture'],
    ['correctOptionId', null],
    ['marks', null],
    ['negativeMarks', null],
    ['explanation', ' '],
    ['year', null],
  ])('rejects catalog candidate with %s = %s', (field, value) => {
    const question = { ...catalogCandidate(), [field]: value };
    expect(() => createLocalQuestionRepository([question])).toThrow();
  });

  it.each(['answerKeyReference', 'originalQuestionNumber'])(
    'requires PYQ source field %s',
    (field) => {
      const question = catalogCandidate();
      expect(() =>
        createLocalQuestionRepository([
          { ...question, source: { ...question.source, [field]: null } },
        ]),
      ).toThrow();
    },
  );

  it.each(
    sourceCategorySchema.options.filter(
      (category) => category !== 'actual-pyq',
    ),
  )('never promotes %s to a verified PYQ', (category) => {
    const question = catalogCandidate();
    const practice = { ...question, source: { ...question.source, category } };
    expect(scoredQuestionSchema.safeParse(practice).success).toBe(true);
    expect(() => createLocalQuestionRepository([practice])).toThrow();
    expect(practice.source.category).toBe(category);
  });

  it('keeps developer fixtures out of both catalogs regardless of review flags', () => {
    for (const question of developerQuestions) {
      expect(scoredQuestionSchema.safeParse(question).success).toBe(false);
      expect(() => createLocalQuestionRepository([question])).toThrow();
    }
    expect(localQuestionRepository.listVerifiedPyqs()).toEqual([]);
  });

  it('rejects duplicate IDs, malformed containers and mixed valid/invalid loads atomically', () => {
    const question = catalogCandidate();
    expect(() => createLocalQuestionRepository([question, question])).toThrow(
      /Duplicate question ID/,
    );
    expect(() => createLocalQuestionRepository({ questions: [] })).toThrow();
    expect(() =>
      createLocalQuestionRepository([
        question,
        { ...question, id: 'bad', approvalStatus: 'pending' },
      ]),
    ).toThrow();
  });

  it('protects the repository snapshot from input and consumer mutations', () => {
    const question = catalogCandidate();
    const repository = createLocalQuestionRepository([question]);
    question.text = 'Changed after loading';
    const loaded = repository.listVerifiedPyqs();
    loaded[0]!.source.reference = 'Changed by consumer';
    expect(repository.listVerifiedPyqs()[0]!.source.reference).toContain(
      'SYNTHETIC SCHEMA TEST ONLY',
    );
    expect(repository.listVerifiedPyqs()[0]!.text).not.toBe(
      'Changed after loading',
    );
  });
});
