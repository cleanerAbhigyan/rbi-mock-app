import { createHash } from 'node:crypto';
import {
  intakeBatchSchema,
  questionReviewSchema,
  sourceDocumentSchema,
} from '../../schemas/source-intake.ts';
import type {
  CatalogProvenance,
  IntakeBatch,
  IntakeCandidate,
  QuestionReview,
  SourceDocument,
} from '../../schemas/source-intake.ts';
import { verifiedPyqSchema } from '../../schemas/question.ts';
import type { VerifiedPyq } from '../../schemas/question.ts';

export function fingerprint(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function correctionProofs(
  changes: { field: string; before: string; after: string }[],
) {
  return changes.map((change) => ({
    field: change.field,
    beforeDigest: fingerprint(change.before),
    afterDigest: fingerprint(change.after),
  }));
}

/** Only CRLF/CR → LF and outer whitespace trimming; no punctuation/meaning/key inference. */
const normalizeText = (value: string) => value.replace(/\r\n?/g, '\n').trim();
export function normalizeCandidate(candidate: IntakeCandidate) {
  const q = candidate.question;
  const text = normalizeText(candidate.rawContent.text);
  const options = candidate.rawContent.options.map((option) => ({
    id: normalizeText(option.id),
    text: normalizeText(option.text),
  }));
  if (
    text !== normalizeText(q.text) ||
    JSON.stringify(options) !==
      JSON.stringify(
        q.options.map((o) => ({
          id: normalizeText(o.id),
          text: normalizeText(o.text),
        })),
      )
  )
    throw new Error(
      `Question ${q.id}: raw and normalized content differ substantively; revise the intake instead of inventing corrections.`,
    );
  const corrections = [
    { field: 'text', before: candidate.rawContent.text, after: text },
    ...candidate.rawContent.options.flatMap((option, i) => [
      { field: `options.${i}.id`, before: option.id, after: options[i]!.id },
      {
        field: `options.${i}.text`,
        before: option.text,
        after: options[i]!.text,
      },
    ]),
  ].filter((change) => change.before !== change.after);
  return {
    candidate: { ...candidate, question: { ...q, text, options } },
    corrections,
  };
}

const tokens = (text: string) =>
  new Set(
    text
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .split(/\s+/),
  );
export function possibleDuplicates(
  candidates: readonly IntakeCandidate[],
  catalog: readonly VerifiedPyq[] = [],
) {
  const questions = [...candidates.map((c) => c.question), ...catalog];
  const flags: {
    questionId: string;
    otherQuestionId: string;
    reason: string;
  }[] = [];
  candidates.forEach((candidate, i) => {
    for (let j = i + 1; j < questions.length; j++) {
      const other = questions[j]!;
      const a = tokens(candidate.question.text);
      const b = tokens(other.text);
      const intersection = [...a].filter((token) => b.has(token)).length;
      const similarity = intersection / new Set([...a, ...b]).size;
      if (
        similarity === 1 ||
        (Math.min(a.size, b.size) >= 4 && similarity >= 0.85)
      )
        flags.push({
          questionId: candidate.question.id,
          otherQuestionId: other.id,
          reason:
            'Possible text duplicate; human evidence review required. No merge performed.',
        });
    }
  });
  return flags;
}

export function stageIntake(
  input: unknown,
  catalog: readonly VerifiedPyq[] = [],
) {
  const parsed = intakeBatchSchema.parse(input);
  const normalized = parsed.candidates.map(normalizeCandidate);
  const batch = intakeBatchSchema.parse({
    ...parsed,
    candidates: normalized.map((record) => record.candidate),
  });
  return {
    stageVersion: '1.0' as const,
    state: 'staged' as const,
    batch,
    questions: normalized.map(({ candidate, corrections }) => ({
      questionId: candidate.question.id,
      candidateDigest: fingerprint(candidate),
      questionDigest: fingerprint(candidate.question),
      normalizationCorrections: corrections,
    })),
    possibleDuplicates: possibleDuplicates(batch.candidates, catalog),
  };
}

export interface QuestionEvidence {
  sources: SourceDocument[];
  reviews: QuestionReview[];
}
function requireEvidence(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}

function identity(source: SourceDocument) {
  const {
    id,
    exam,
    phase,
    year,
    paperOrSection,
    reference,
    documentType,
    publisher,
    attribution,
    documentDetails,
    originalDocumentReference,
  } = source;
  return {
    id,
    exam,
    phase,
    year,
    paperOrSection,
    reference,
    documentType,
    publisher,
    attribution,
    documentDetails,
    originalDocumentReference,
  };
}

export function assertPublicSource(source: SourceDocument) {
  requireEvidence(
    source.permission.status === 'redistribution-permitted' &&
      source.permission.evidenceReference &&
      source.permission.reviewedOn &&
      source.reviewedOn &&
      source.permission.publicMetadataAllowed,
    `Source ${source.id}: dated human source review, permission evidence and public metadata permission are required.`,
  );
}

/** Evidence is supplied by the fixed, committed repository ledger in the operator CLI, never by an import envelope. */
export function promoteIntake(
  input: unknown,
  evidence: QuestionEvidence,
  catalog: readonly VerifiedPyq[] = [],
  provenance: readonly CatalogProvenance[] = [],
) {
  const staged = stageIntake(input, catalog);
  const sources = evidence.sources.map((source) =>
    sourceDocumentSchema.parse(source),
  );
  const reviews = evidence.reviews.map((review) =>
    questionReviewSchema.parse(review),
  );
  requireEvidence(
    new Set(sources.map((s) => s.id)).size === sources.length,
    'Duplicate trusted source IDs.',
  );
  requireEvidence(
    new Set(reviews.map((r) => r.id)).size === reviews.length,
    'Duplicate review IDs.',
  );
  const questions: VerifiedPyq[] = [];
  const traces: CatalogProvenance[] = [];
  for (const candidate of staged.batch.candidates) {
    const q = candidate.question;
    const prefix = `Question ${q.id}: `;
    const source = sources.find((s) => s.id === candidate.sourceId);
    requireEvidence(
      source,
      prefix + 'source is not in the trusted repository ledger.',
    );
    assertPublicSource(source);
    const submittedSource = staged.batch.sources.find(
      (s) => s.id === source.id,
    )!;
    requireEvidence(
      JSON.stringify(identity(source)) ===
        JSON.stringify(identity(submittedSource)),
      prefix + 'source identity conflicts with the trusted source record.',
    );
    requireEvidence(
      q.source.category === 'actual-pyq' &&
        ['official-paper', 'archived-paper'].includes(source.documentType),
      prefix +
        'only independently reviewed actual historical papers can enter the PYQ catalog.',
    );
    requireEvidence(
      q.year === source.year &&
        q.year !== null &&
        q.phase === source.phase &&
        q.paperOrSection === source.paperOrSection,
      prefix + 'year/phase/paper must match the reviewed source.',
    );
    requireEvidence(
      q.source.originalQuestionNumber !== null,
      prefix + 'original question number is required.',
    );
    requireEvidence(
      !catalog.some((item) => item.id === q.id),
      prefix +
        'ID already exists; catalog revision replacement requires a separate explicit migration.',
    );
    requireEvidence(
      !provenance.some(
        (trace) =>
          trace.sourceId === source.id &&
          catalog.find((item) => item.id === trace.questionId)?.source
            .originalQuestionNumber === q.source.originalQuestionNumber,
      ),
      prefix + 'source/question number already exists in the catalog.',
    );
    const matches = reviews.filter(
      (r) =>
        r.questionId === q.id &&
        r.questionRevision === q.revision &&
        r.batchId === staged.batch.batchId,
    );
    requireEvidence(
      matches.length === 1,
      prefix + 'exactly one independent human review decision is required.',
    );
    const review = matches[0]!;
    const normalized = staged.questions.find(
      (item) => item.questionId === q.id,
    )!;
    requireEvidence(
      review.decision === 'approved' &&
        review.reviewer.kind === 'human' &&
        review.reviewer.id !== staged.batch.importedBy,
      prefix + 'independent human approval is required.',
    );
    requireEvidence(
      review.sourceId === source.id &&
        review.sourceDigest === fingerprint(source) &&
        review.candidateDigest === normalized.candidateDigest &&
        review.questionDigest === normalized.questionDigest,
      prefix +
        'review/source/content fingerprint mismatch; re-review the current revision.',
    );
    requireEvidence(
      review.checkedCategory === q.source.category &&
        review.rightsDecision === 'approved-for-public-catalog',
      prefix +
        'category and public redistribution rights must be independently approved.',
    );
    requireEvidence(
      candidate.answerKeyEvidenceReference &&
        candidate.scoringEvidenceReference &&
        q.source.answerKeyReference === candidate.answerKeyEvidenceReference &&
        review.evidence.answerKey === candidate.answerKeyEvidenceReference &&
        review.evidence.scoring === candidate.scoringEvidenceReference &&
        review.evidence.rights === source.permission.evidenceReference,
      prefix + 'missing or mismatched key/scoring/rights evidence.',
    );
    requireEvidence(
      review.reviewedOn >= staged.batch.createdOn &&
        review.reviewedOn >= source.reviewedOn! &&
        review.reviewedOn >= source.permission.reviewedOn! &&
        q.year <= Number(review.reviewedOn.slice(0, 4)),
      prefix +
        'review chronology cannot establish a future historical question.',
    );
    requireEvidence(
      JSON.stringify(review.normalizationCorrections) ===
        JSON.stringify(correctionProofs(normalized.normalizationCorrections)),
      prefix + 'normalization corrections must be explicitly checked.',
    );
    for (const note of candidate.extraction.ambiguityNotes)
      requireEvidence(
        review.resolvedAmbiguities.filter((r) => r.note === note).length === 1,
        prefix + 'unresolved extraction ambiguity.',
      );
    for (const flag of staged.possibleDuplicates.filter(
      (f) => f.questionId === q.id || f.otherQuestionId === q.id,
    )) {
      const other =
        flag.questionId === q.id ? flag.otherQuestionId : flag.questionId;
      requireEvidence(
        review.duplicateResolutions.filter((r) => r.otherQuestionId === other)
          .length === 1,
        prefix +
          `possible duplicate ${other} needs an explicit distinct-question evidence decision.`,
      );
    }
    const approved = verifiedPyqSchema.parse({
      ...q,
      verificationStatus: 'verified',
      approvalStatus: 'approved',
    });
    questions.push(approved);
    traces.push({
      questionId: q.id,
      questionRevision: q.revision,
      sourceId: source.id,
      reviewId: review.id,
      batchId: staged.batch.batchId,
      candidateDigest: normalized.candidateDigest,
      questionDigest: normalized.questionDigest,
      sourceDigest: fingerprint(source),
    });
  }
  return {
    questions: [...catalog, ...questions],
    provenance: [...provenance, ...traces],
  };
}

/** CI check of public output: changing content/keys/scoring requires a new human-reviewed fingerprint. */
export function checkPublishedCatalog(
  catalog: readonly VerifiedPyq[],
  provenance: readonly CatalogProvenance[],
  evidence: QuestionEvidence,
) {
  requireEvidence(
    new Set(catalog.map((question) => question.id)).size === catalog.length,
    'Duplicate published question IDs.',
  );
  requireEvidence(
    provenance.length === catalog.length,
    'Every approved question requires exactly one provenance entry.',
  );
  requireEvidence(
    new Set(provenance.map((trace) => trace.questionId)).size ===
      provenance.length,
    'Duplicate catalog provenance IDs.',
  );
  const sourceNumbers = new Set<string>();
  for (const question of catalog) {
    const trace = provenance.find(
      (item) =>
        item.questionId === question.id &&
        item.questionRevision === question.revision,
    );
    const review = evidence.reviews.find((item) => item.id === trace?.reviewId);
    const source = evidence.sources.find((item) => item.id === trace?.sourceId);
    requireEvidence(
      trace && review && source,
      `Question ${question.id}: missing source/review traceability.`,
    );
    const sourceNumber = JSON.stringify([
      source.id,
      question.source.originalQuestionNumber,
    ]);
    requireEvidence(
      !sourceNumbers.has(sourceNumber),
      `Question ${question.id}: duplicate published source/question-number combination.`,
    );
    sourceNumbers.add(sourceNumber);
    assertPublicSource(source);
    requireEvidence(
      review.evidence.rights === source.permission.evidenceReference &&
        review.evidence.answerKey === question.source.answerKeyReference &&
        review.reviewedOn >= source.reviewedOn! &&
        question.year! <= Number(review.reviewedOn.slice(0, 4)),
      `Question ${question.id}: evidence references or chronology do not match.`,
    );
    requireEvidence(
      question.phase === source.phase &&
        question.year === source.year &&
        question.paperOrSection === source.paperOrSection &&
        question.source.reference ===
          (source.reference.kind === 'url'
            ? source.reference.url
            : source.reference.citation) &&
        ['official-paper', 'archived-paper'].includes(source.documentType),
      `Question ${question.id}: reviewed historical source identity mismatch.`,
    );
    const questionDigest = fingerprint({
      ...verifiedPyqSchema.parse(question),
      verificationStatus: 'unverified',
      approvalStatus: 'pending',
    });
    requireEvidence(
      review.decision === 'approved' &&
        review.rightsDecision === 'approved-for-public-catalog' &&
        review.checkedCategory === 'actual-pyq' &&
        review.questionId === question.id &&
        review.questionRevision === question.revision &&
        review.sourceId === source.id &&
        review.batchId === trace.batchId &&
        review.questionDigest === questionDigest &&
        trace.questionDigest === questionDigest &&
        review.candidateDigest === trace.candidateDigest &&
        review.sourceDigest === fingerprint(source) &&
        trace.sourceDigest === review.sourceDigest,
      `Question ${question.id}: published content is not bound to its reviewed source and revision.`,
    );
  }
}

export type StagedIntake = ReturnType<typeof stageIntake>;
export type { IntakeBatch };
