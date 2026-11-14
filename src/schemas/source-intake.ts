import { z } from 'zod';
import { objectiveQuestionSchema, sourceCategorySchema } from './question.ts';

export const auditId = z
  .string()
  .trim()
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/,
    'Use a stable ID with letters, digits, dots, colons, underscores or hyphens.',
  );
export const citation = z.string().trim().min(1);
export const digest = z
  .string()
  .regex(/^[a-f0-9]{64}$/, 'Expected a SHA-256 fingerprint.');
export const exam = z.literal('RBI Grade B (DR-General)');
export const phase = z.enum(['phase-i', 'phase-ii']);
export const sourceYear = z.number().int().min(1935).max(9999);
export const humanReviewer = z.strictObject({
  kind: z.literal('human'),
  id: auditId,
});

export const sourceDocumentSchema = z
  .strictObject({
    schemaVersion: z.literal('1.0'),
    id: auditId,
    exam,
    phase,
    year: sourceYear.nullable(),
    paperOrSection: citation,
    reference: z.discriminatedUnion('kind', [
      z.strictObject({
        kind: z.literal('url'),
        url: z
          .url()
          .refine(
            (url) => url.startsWith('https://'),
            'Use an HTTPS source URL.',
          ),
      }),
      z.strictObject({ kind: z.literal('local-reference'), citation }),
    ]),
    documentType: z.enum([
      'official-paper',
      'archived-paper',
      'official-notice',
      'official-handout',
      'reconstruction',
      'practice',
      'other',
    ]),
    publisher: citation,
    attribution: citation,
    documentDetails: citation,
    originalDocumentReference: citation,
    retrievedOn: z.iso.date(),
    reviewedOn: z.iso.date().nullable(),
    permission: z.strictObject({
      status: z.enum(['unknown', 'restricted', 'redistribution-permitted']),
      evidenceReference: citation.nullable(),
      reviewedOn: z.iso.date().nullable(),
      publicMetadataAllowed: z.boolean(),
      documentPublishable: z.boolean(),
    }),
  })
  .superRefine((source, ctx) => {
    if (source.reviewedOn && source.reviewedOn < source.retrievedOn)
      ctx.addIssue({
        code: 'custom',
        path: ['reviewedOn'],
        message: 'Review cannot precede retrieval.',
      });
    if (
      source.permission.reviewedOn &&
      source.permission.reviewedOn < source.retrievedOn
    )
      ctx.addIssue({
        code: 'custom',
        path: ['permission', 'reviewedOn'],
        message: 'Permission review cannot precede retrieval.',
      });
    if (
      source.permission.status === 'redistribution-permitted' &&
      (!source.permission.evidenceReference || !source.permission.reviewedOn)
    )
      ctx.addIssue({
        code: 'custom',
        path: ['permission'],
        message:
          'Permission needs a dated evidence reference; this assertion is not independent approval.',
      });
  });

export const candidateQuestionSchema = z.strictObject({
  sourceId: auditId,
  rawContent: z.strictObject({
    text: z.string().min(1),
    options: z
      .array(z.strictObject({ id: z.string().min(1), text: z.string().min(1) }))
      .min(2)
      .max(10),
  }),
  question: objectiveQuestionSchema.safeExtend({
    id: auditId,
    usage: z.literal('catalog'),
    verificationStatus: z.literal('unverified'),
    approvalStatus: z.literal('pending'),
    explanation: z
      .string()
      .refine(
        (value) => value === value.trim(),
        'Explanation must already be trimmed; record content edits in a new reviewed revision.',
      ),
  }),
  answerKeyEvidenceReference: citation.nullable(),
  scoringEvidenceReference: citation.nullable(),
  extraction: z.strictObject({
    confidence: z.number().min(0).max(1),
    ambiguityNotes: z.array(citation),
    notes: z.string(),
  }),
});

export const intakeBatchSchema = z
  .strictObject({
    importVersion: z.literal('1.0'),
    batchId: auditId,
    importedBy: auditId,
    createdOn: z.iso.date(),
    sources: z.array(sourceDocumentSchema).min(1),
    candidates: z.array(candidateQuestionSchema).min(1),
  })
  .superRefine((batch, ctx) => {
    const sources = new Map(batch.sources.map((source) => [source.id, source]));
    if (sources.size !== batch.sources.length)
      ctx.addIssue({
        code: 'custom',
        path: ['sources'],
        message: 'Duplicate source IDs in intake batch.',
      });
    const ids = new Set<string>();
    const sourceNumbers = new Set<string>();
    batch.candidates.forEach((candidate, index) => {
      const q = candidate.question;
      const source = sources.get(candidate.sourceId);
      const problem = (message: string) =>
        ctx.addIssue({ code: 'custom', path: ['candidates', index], message });
      if (ids.has(q.id))
        problem(
          `Duplicate question ID ${q.id}; a batch cannot contain multiple revisions of one ID.`,
        );
      ids.add(q.id);
      if (!source) {
        problem(`Unknown source ID ${candidate.sourceId}.`);
        return;
      }
      if (
        q.exam !== source.exam ||
        q.phase !== source.phase ||
        q.paperOrSection !== source.paperOrSection ||
        (q.year !== null && q.year !== source.year)
      )
        problem(
          'Question exam/phase/year/paper conflicts with its source manifest.',
        );
      const ref =
        source.reference.kind === 'url'
          ? source.reference.url
          : source.reference.citation;
      if (q.source.reference !== ref)
        problem('Question source reference must match its source manifest.');
      if (q.source.originalQuestionNumber !== null) {
        const key = JSON.stringify([
          candidate.sourceId,
          q.source.originalQuestionNumber,
        ]);
        if (sourceNumbers.has(key))
          problem(
            `Duplicate source/question-number combination for ${candidate.sourceId}.`,
          );
        sourceNumbers.add(key);
      }
    });
  });

export const normalizationChangeSchema = z.strictObject({
  field: citation,
  before: z.string(),
  after: z.string(),
});
export const correctionProofSchema = z.strictObject({
  field: citation,
  beforeDigest: digest,
  afterDigest: digest,
});
export const questionReviewSchema = z.strictObject({
  id: auditId,
  batchId: auditId,
  questionId: auditId,
  questionRevision: z.number().int().positive(),
  sourceId: auditId,
  candidateDigest: digest,
  questionDigest: digest,
  sourceDigest: digest,
  reviewer: humanReviewer,
  reviewedOn: z.iso.date(),
  decision: z.enum(['approved', 'rejected']),
  checkedCategory: sourceCategorySchema,
  evidence: z.strictObject({
    source: citation,
    answerKey: citation,
    scoring: citation,
    rights: citation,
  }),
  rightsDecision: z.enum([
    'approved-for-public-catalog',
    'restricted',
    'unknown',
  ]),
  normalizationCorrections: z.array(correctionProofSchema),
  resolvedAmbiguities: z.array(
    z.strictObject({
      note: citation,
      resolution: citation,
      evidenceReference: citation,
    }),
  ),
  duplicateResolutions: z.array(
    z.strictObject({
      otherQuestionId: auditId,
      disposition: z.literal('distinct'),
      evidenceReference: citation,
    }),
  ),
  limitations: z.array(citation),
});

export const catalogProvenanceSchema = z.strictObject({
  questionId: auditId,
  questionRevision: z.number().int().positive(),
  sourceId: auditId,
  reviewId: auditId,
  batchId: auditId,
  candidateDigest: digest,
  questionDigest: digest,
  sourceDigest: digest,
});

export type SourceDocument = z.infer<typeof sourceDocumentSchema>;
export type IntakeBatch = z.infer<typeof intakeBatchSchema>;
export type IntakeCandidate = z.infer<typeof candidateQuestionSchema>;
export type QuestionReview = z.infer<typeof questionReviewSchema>;
export type CatalogProvenance = z.infer<typeof catalogProvenanceSchema>;
