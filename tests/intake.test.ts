import { describe, expect, it } from 'vitest';
import {
  candidateQuestionSchema,
  intakeBatchSchema,
  sourceDocumentSchema,
} from '../src/schemas/source-intake';
import { sourceCategorySchema } from '../src/schemas/question';
import {
  checkPublishedCatalog,
  fingerprint,
  promoteIntake,
  stageIntake,
} from '../src/features/intake/pipeline';
import {
  assertCatalogTraceability,
  parseEvidence,
} from '../src/features/intake/evidence';
import { intakeFixture, reviewsFor } from './fixtures/intake';

describe('source manifests and atomic intake', () => {
  it('stages synthetic test input separately without changing its source category or granting approval', () => {
    const { batch } = intakeFixture();
    const before = structuredClone(batch);
    const staged = stageIntake(batch);
    expect(staged.state).toBe('staged');
    expect(staged.batch.candidates[0]!.question.approvalStatus).toBe('pending');
    expect(staged.questions[0]!.candidateDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(batch).toEqual(before);
  });
  it.each(sourceCategorySchema.options)(
    'preserves original source category %s',
    (category) => {
      const { batch } = intakeFixture();
      batch.candidates[0]!.question.source.category = category;
      expect(
        stageIntake(batch).batch.candidates[0]!.question.source.category,
      ).toBe(category);
      if (category !== 'actual-pyq')
        expect(() =>
          promoteIntake(batch, {
            sources: batch.sources,
            reviews: reviewsFor(batch),
          }),
        ).toThrow(/actual historical/);
    },
  );
  it('normalizes only supported whitespace/newlines and requires human acknowledgment of each correction', () => {
    const { batch } = intakeFixture();
    const candidate = batch.candidates[0]!;
    candidate.rawContent.text = ` \r\n${candidate.question.text}\r\n `;
    candidate.rawContent.options[0]!.text = ` ${candidate.question.options[0]!.text} `;
    const staged = stageIntake(batch);
    expect(staged.batch.candidates[0]!.rawContent.text).toContain('\r\n');
    expect(staged.questions[0]!.normalizationCorrections).toHaveLength(2);
    const reviews = reviewsFor(batch);
    reviews[0]!.normalizationCorrections = [];
    expect(() =>
      promoteIntake(batch, { sources: batch.sources, reviews }),
    ).toThrow(/normalization corrections/);
    expect(
      promoteIntake(batch, {
        sources: batch.sources,
        reviews: reviewsFor(batch),
      }).questions,
    ).toHaveLength(1);
    candidate.question.text = 'A different invented meaning';
    expect(() => stageIntake(batch)).toThrow(/substantively/);
  });
  it('rejects duplicate question IDs, source IDs and source/question-number pairs', () => {
    const { batch } = intakeFixture();
    expect(() =>
      stageIntake({
        ...batch,
        candidates: [...batch.candidates, batch.candidates[0]],
      }),
    ).toThrow(/Duplicate question ID/);
    expect(() =>
      stageIntake({ ...batch, sources: [...batch.sources, batch.sources[0]] }),
    ).toThrow(/Duplicate source IDs/);
    const alias = structuredClone(batch.candidates[0]!);
    alias.question.id = 'synthetic-alias';
    expect(() =>
      stageIntake({ ...batch, candidates: [...batch.candidates, alias] }),
    ).toThrow(/source\/question-number/);
  });
  it('rejects inconsistent identities, malformed options/keys, unrecognized versions and incomplete source citations', () => {
    const { batch, source } = intakeFixture();
    expect(
      sourceDocumentSchema.safeParse({ ...source, publisher: ' ' }).success,
    ).toBe(false);
    expect(
      sourceDocumentSchema.safeParse({
        ...source,
        permission: { ...source.permission, evidenceReference: null },
      }).success,
    ).toBe(false);
    expect(
      sourceDocumentSchema.safeParse({ ...source, reviewedOn: '1999-12-31' })
        .success,
    ).toBe(false);
    expect(
      sourceDocumentSchema.safeParse({
        ...source,
        permission: { ...source.permission, reviewedOn: '1999-12-31' },
      }).success,
    ).toBe(false);
    expect(
      intakeBatchSchema.safeParse({ ...batch, importVersion: '2.0' }).success,
    ).toBe(false);
    for (const questionPatch of [
      { phase: 'phase-iii' },
      { phase: 'phase-ii' },
      { year: 2001 },
      { options: [] },
      { correctOptionId: 'missing' },
    ]) {
      expect(() =>
        stageIntake({
          ...batch,
          candidates: [
            {
              ...batch.candidates[0],
              question: { ...batch.candidates[0]!.question, ...questionPatch },
            },
          ],
        }),
      ).toThrow();
    }
    expect(() =>
      stageIntake({
        ...batch,
        candidates: [{ ...batch.candidates[0], sourceId: 'missing' }],
      }),
    ).toThrow(/Unknown source/);
  });
  it('rejects imported verified/approved flags and review artifacts supplied inside an arbitrary envelope', () => {
    const { batch, evidence } = intakeFixture();
    expect(
      candidateQuestionSchema.safeParse({
        ...batch.candidates[0],
        question: {
          ...batch.candidates[0]!.question,
          verificationStatus: 'verified',
          approvalStatus: 'approved',
        },
      }).success,
    ).toBe(false);
    expect(() =>
      stageIntake({ ...batch, reviews: evidence.reviews }),
    ).toThrow();
    expect(() => promoteIntake(batch, { sources: [], reviews: [] })).toThrow(
      /trusted repository/,
    );
  });
});

describe('human review and public-catalog admission', () => {
  it('binds approved synthetic contract output to a source and independent review without weakening runtime schema 1.0', () => {
    const { batch, evidence } = intakeFixture();
    const output = promoteIntake(batch, evidence);
    expect(output.questions[0]).toMatchObject({
      schemaVersion: '1.0',
      verificationStatus: 'verified',
      approvalStatus: 'approved',
    });
    expect(output.provenance[0]).toMatchObject({
      questionId: batch.candidates[0]!.question.id,
      reviewId: evidence.reviews[0]!.id,
      sourceId: evidence.sources[0]!.id,
      batchId: batch.batchId,
    });
    expect(() =>
      checkPublishedCatalog(output.questions, output.provenance, evidence),
    ).not.toThrow();
    const publicLedger = parseEvidence({
      ...evidence,
      profileReviews: [],
      provenance: output.provenance,
    });
    expect(() =>
      assertCatalogTraceability(output.questions, publicLedger),
    ).not.toThrow();
    expect(() =>
      assertCatalogTraceability(output.questions, {
        ...publicLedger,
        provenance: [],
      }),
    ).toThrow(/provenance/);
    const changed = structuredClone(output.questions);
    changed[0]!.correctOptionId = 'a';
    expect(() =>
      checkPublishedCatalog(changed, output.provenance, evidence),
    ).toThrow(/reviewed source and revision/);
  });
  it.each([
    'missing',
    'rejected',
    'same-reviewer',
    'ambiguous',
    'wrong-revision',
    'changed-question',
    'changed-source',
    'missing-key',
    'missing-scoring',
    'restricted-rights',
    'missing-number',
    'missing-year',
    'missing-weights',
    'future-question',
  ])('rejects %s before producing any partial output', (scenario) => {
    const { batch, evidence } = intakeFixture();
    const untouched = JSON.stringify(evidence);
    const review = evidence.reviews[0]!;
    const candidate = batch.candidates[0]!;
    switch (scenario) {
      case 'missing':
        evidence.reviews = [];
        break;
      case 'rejected':
        review.decision = 'rejected';
        break;
      case 'same-reviewer':
        review.reviewer.id = batch.importedBy;
        break;
      case 'ambiguous':
        evidence.reviews.push({ ...review, id: 'synthetic-other-review' });
        break;
      case 'wrong-revision':
        review.questionRevision++;
        break;
      case 'changed-question':
        candidate.question.explanation += ' Edited after review.';
        break;
      case 'changed-source':
        evidence.sources[0]!.documentDetails += ' changed';
        break;
      case 'missing-key':
        candidate.question.correctOptionId = null;
        evidence.reviews = reviewsFor(batch);
        break;
      case 'missing-scoring':
        candidate.scoringEvidenceReference = null;
        evidence.reviews = reviewsFor(batch);
        break;
      case 'restricted-rights':
        evidence.sources[0]!.permission.status = 'restricted';
        break;
      case 'missing-number':
        candidate.question.source.originalQuestionNumber = null;
        evidence.reviews = reviewsFor(batch);
        break;
      case 'missing-year':
        candidate.question.year = null;
        evidence.reviews = reviewsFor(batch);
        break;
      case 'missing-weights':
        candidate.question.marks = null;
        evidence.reviews = reviewsFor(batch);
        break;
      case 'future-question':
        candidate.question.year = 2027;
        batch.sources[0]!.year = 2027;
        evidence.sources = batch.sources;
        evidence.reviews = reviewsFor(batch);
        break;
    }
    const before = JSON.stringify({ batch, evidence });
    expect(() => promoteIntake(batch, evidence)).toThrow();
    expect(JSON.stringify({ batch, evidence })).toBe(before);
    expect(untouched).toContain('SYNTHETIC');
  });
  it('requires resolution of extraction ambiguity and possible duplicates without merging', () => {
    const { batch } = intakeFixture();
    const second = structuredClone(batch.candidates[0]!);
    second.question.id = 'synthetic-near-duplicate';
    second.question.source.originalQuestionNumber = 'SYNTHETIC-2';
    batch.candidates.push(second);
    batch.candidates[0]!.extraction.ambiguityNotes = [
      'SYNTHETIC uncertain punctuation',
    ];
    const reviews = reviewsFor(batch);
    expect(stageIntake(batch).possibleDuplicates).toHaveLength(1);
    expect(() =>
      promoteIntake(batch, { sources: batch.sources, reviews }),
    ).toThrow(/ambiguity/);
    reviews[0]!.resolvedAmbiguities.push({
      note: batch.candidates[0]!.extraction.ambiguityNotes[0]!,
      resolution: 'SYNTHETIC source checked',
      evidenceReference: 'SYNTHETIC p1',
    });
    expect(() =>
      promoteIntake(batch, { sources: batch.sources, reviews }),
    ).toThrow(/duplicate/);
    reviews.forEach((review, i) =>
      review.duplicateResolutions.push({
        otherQuestionId: batch.candidates[1 - i]!.question.id,
        disposition: 'distinct',
        evidenceReference: 'SYNTHETIC distinct-question decision only',
      }),
    );
    expect(
      promoteIntake(batch, { sources: batch.sources, reviews }).questions,
    ).toHaveLength(2);
  });
  it('rejects an entire mixed-validity batch and existing catalog identity collisions', () => {
    const { batch, evidence } = intakeFixture();
    const approved = promoteIntake(batch, evidence);
    expect(() =>
      promoteIntake(batch, evidence, approved.questions, approved.provenance),
    ).toThrow(/already exists/);
    const second = structuredClone(batch.candidates[0]!);
    second.question.id = 'synthetic-incomplete';
    second.question.source.originalQuestionNumber = 'SYNTHETIC-3';
    second.question.correctOptionId = null;
    batch.candidates.push(second);
    expect(() =>
      promoteIntake(batch, {
        sources: batch.sources,
        reviews: reviewsFor(batch),
      }),
    ).toThrow();
    expect(approved.questions).toHaveLength(1);
  });
  it('treats standalone approval flags as insufficient public runtime evidence', () => {
    const { batch, evidence } = intakeFixture();
    const output = promoteIntake(batch, evidence);
    expect(() => checkPublishedCatalog(output.questions, [], evidence)).toThrow(
      /provenance/,
    );
    expect(() =>
      checkPublishedCatalog(output.questions, output.provenance, {
        ...evidence,
        reviews: [],
      }),
    ).toThrow(/traceability/);
    expect(fingerprint(batch)).toHaveLength(64);
  });
  it('rejects duplicate IDs or source/question pairs even in manually assembled public output', () => {
    const { batch, evidence } = intakeFixture();
    const output = promoteIntake(batch, evidence);
    expect(() =>
      checkPublishedCatalog(
        [...output.questions, ...output.questions],
        output.provenance,
        evidence,
      ),
    ).toThrow(/Duplicate published/);
    const alias = structuredClone(output.questions[0]!);
    alias.id = 'synthetic-alias';
    const trace = {
      ...output.provenance[0]!,
      questionId: alias.id,
      reviewId: 'synthetic-alias-review',
    };
    const review = {
      ...evidence.reviews[0]!,
      id: trace.reviewId,
      questionId: alias.id,
      questionDigest: fingerprint({
        ...alias,
        verificationStatus: 'unverified',
        approvalStatus: 'pending',
      }),
    };
    trace.questionDigest = review.questionDigest;
    expect(() =>
      checkPublishedCatalog(
        [...output.questions, alias],
        [...output.provenance, trace],
        { ...evidence, reviews: [...evidence.reviews, review] },
      ),
    ).toThrow(/duplicate published source/);
  });
});
