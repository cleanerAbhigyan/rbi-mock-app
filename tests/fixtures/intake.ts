/** SYNTHETIC CONTRACT TESTS ONLY. No document, approval, profile or question here is historical evidence. */
import { developerQuestions } from '../../src/data/fixtures/objective-questions';
import { sourceDocumentSchema } from '../../src/schemas/source-intake';
import type {
  IntakeBatch,
  QuestionReview,
} from '../../src/schemas/source-intake';
import {
  correctionProofs,
  fingerprint,
  stageIntake,
} from '../../src/features/intake/pipeline';
import {
  customReferenceProfileSchema,
  verifiedReferenceProfileSchema,
} from '../../src/schemas/exam-profile';
import type { ProfileReview } from '../../src/schemas/exam-profile';
import { profileFactPaths } from '../../src/features/profiles/registry';

export function intakeFixture() {
  const source = sourceDocumentSchema.parse({
    schemaVersion: '1.0',
    id: 'synthetic-source-test-only',
    exam: 'RBI Grade B (DR-General)',
    phase: 'phase-i',
    year: 2000,
    paperOrSection: 'Synthetic contract tests',
    reference: {
      kind: 'url',
      url: 'https://rbi.org.in/synthetic-contract-test-not-a-real-paper',
    },
    documentType: 'official-paper',
    publisher: 'SYNTHETIC TEST ONLY',
    attribution: 'No real source exists. Never publish as PYQs.',
    documentDetails: 'SYNTHETIC CONTRACT TEST ONLY',
    originalDocumentReference: 'SYNTHETIC: no real original document',
    retrievedOn: '2000-01-01',
    reviewedOn: '2000-01-02',
    permission: {
      status: 'redistribution-permitted',
      evidenceReference: 'SYNTHETIC rights test assertion only',
      reviewedOn: '2000-01-02',
      publicMetadataAllowed: true,
      documentPublishable: false,
    },
  });
  const question = {
    ...structuredClone(developerQuestions[0]!),
    id: 'synthetic-intake-question-only',
    usage: 'catalog' as const,
    year: 2000,
    paperOrSection: source.paperOrSection,
    verificationStatus: 'unverified' as const,
    approvalStatus: 'pending' as const,
    source: {
      category: 'actual-pyq' as const,
      reference:
        source.reference.kind === 'url'
          ? source.reference.url
          : source.reference.citation,
      originalQuestionNumber: 'SYNTHETIC-1',
      answerKeyReference: 'SYNTHETIC key evidence only',
    },
  };
  const batch: IntakeBatch = {
    importVersion: '1.0',
    batchId: 'synthetic-batch-test-only',
    importedBy: 'synthetic-importer',
    createdOn: '2000-01-02',
    sources: [source],
    candidates: [
      {
        sourceId: source.id,
        rawContent: {
          text: question.text,
          options: structuredClone(question.options),
        },
        question,
        answerKeyEvidenceReference: question.source.answerKeyReference,
        scoringEvidenceReference: 'SYNTHETIC scoring evidence only',
        extraction: {
          confidence: 1,
          ambiguityNotes: [],
          notes: 'Synthetic test data only.',
        },
      },
    ],
  };
  return {
    batch,
    source,
    evidence: { sources: [source], reviews: reviewsFor(batch) },
  };
}

export function reviewsFor(batch: IntakeBatch): QuestionReview[] {
  const staged = stageIntake(batch);
  return staged.batch.candidates.map((candidate) => {
    const binding = staged.questions.find(
      (q) => q.questionId === candidate.question.id,
    )!;
    return {
      id: `synthetic-review-${candidate.question.id}`,
      batchId: batch.batchId,
      questionId: candidate.question.id,
      questionRevision: candidate.question.revision,
      sourceId: candidate.sourceId,
      candidateDigest: binding.candidateDigest,
      questionDigest: binding.questionDigest,
      sourceDigest: fingerprint(
        batch.sources.find((s) => s.id === candidate.sourceId)!,
      ),
      reviewer: { kind: 'human', id: 'synthetic-independent-reviewer' },
      reviewedOn: '2000-01-03',
      decision: 'approved',
      checkedCategory: candidate.question.source.category,
      evidence: {
        source: 'SYNTHETIC checked original evidence',
        answerKey: candidate.answerKeyEvidenceReference!,
        scoring: candidate.scoringEvidenceReference!,
        rights: batch.sources[0]!.permission.evidenceReference!,
      },
      rightsDecision: 'approved-for-public-catalog',
      normalizationCorrections: correctionProofs(
        binding.normalizationCorrections,
      ),
      resolvedAmbiguities: [],
      duplicateResolutions: [],
      limitations: [
        'SYNTHETIC assertion for tests; no actual human historical approval.',
      ],
    };
  });
}

export function customProfileFixture() {
  return customReferenceProfileSchema.parse({
    schemaVersion: '1.0',
    id: 'synthetic-custom-profile',
    revision: 1,
    exam: 'RBI Grade B (DR-General)',
    phase: 'phase-i',
    year: null,
    referenceLabel: 'SYNTHETIC CUSTOM PROFILE TEST',
    preparedBy: 'synthetic-preparer',
    validFrom: null,
    validUntil: null,
    totalQuestionCount: 5,
    timing: { mode: 'sectioned', totalDurationSeconds: 90 },
    sections: [
      {
        id: 'synthetic-section-a',
        title: 'Synthetic A',
        order: 1,
        questionCount: 2,
        durationSeconds: 30,
        navigation: 'sequential-locked',
      },
      {
        id: 'synthetic-section-b',
        title: 'Synthetic B',
        order: 2,
        questionCount: 3,
        durationSeconds: 60,
        navigation: 'sequential-locked',
      },
    ],
    marking: {
      default: { marks: 1, negativeMarks: 0.25 },
      sectionOverrides: [],
      questionOverrides: [],
    },
    sourceStatus: 'custom-practice',
    sourceEvidence: null,
  });
}

export function officialProfileFixture() {
  const { source } = intakeFixture();
  const officialSource = sourceDocumentSchema.parse({
    ...source,
    documentType: 'official-handout',
    publisher: 'Reserve Bank of India',
  });
  const base = customProfileFixture();
  const profile = verifiedReferenceProfileSchema.parse({
    ...base,
    id: 'synthetic-reference-profile-only',
    year: 2000,
    sourceStatus: 'official-source-verified',
    sourceEvidence: {
      sourceId: source.id,
      officialUrl: source.reference.kind === 'url' ? source.reference.url : '',
      publisher: 'Reserve Bank of India',
      noticeDetails: 'SYNTHETIC notice test only',
      handoutDetails: 'SYNTHETIC handout test only',
      verificationNotes: 'SYNTHETIC; not an actual verified reference',
      verifiedOn: '2000-01-03',
      reviewId: 'synthetic-profile-review-only',
      fieldCitations: profileFactPaths(base).map((field) => ({
        field,
        reference: 'SYNTHETIC field citation, no actual handout',
      })),
    },
  });
  const review: ProfileReview = {
    id: profile.sourceEvidence.reviewId,
    profileId: profile.id,
    profileRevision: profile.revision,
    profileDigest: fingerprint(profile),
    sourceId: source.id,
    sourceDigest: fingerprint(officialSource),
    reviewer: { kind: 'human', id: 'synthetic-independent-reviewer' },
    reviewedOn: '2000-01-03',
    decision: 'approved',
    checkedFields: profileFactPaths(profile),
    evidenceNotes: 'Synthetic test only.',
    limitations: ['Not historical evidence.'],
  };
  return {
    profile,
    evidence: { sources: [officialSource], reviews: [review] },
  };
}
