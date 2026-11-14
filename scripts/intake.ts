import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
  existsSync,
  unlinkSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { verifiedPyqSchema } from '../src/schemas/question.ts';
import {
  intakeBatchSchema,
  normalizationChangeSchema,
  digest,
  auditId,
} from '../src/schemas/source-intake.ts';
import {
  parseEvidence,
  assertCatalogTraceability,
} from '../src/features/intake/evidence.ts';
import {
  checkPublishedCatalog,
  correctionProofs,
  fingerprint,
  promoteIntake,
  stageIntake,
} from '../src/features/intake/pipeline.ts';
import { checkReferenceProfiles } from '../src/features/profiles/check.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const paths = {
  sources: 'src/data/source-review/sources.json',
  reviews: 'src/data/source-review/question-reviews.json',
  profileReviews: 'src/data/source-review/profile-reviews.json',
  provenance: 'src/data/source-review/catalog-provenance.json',
};
const readJson = (path: string) =>
  JSON.parse(readFileSync(resolve(root, path), 'utf8')) as unknown;
function loadEvidence(committed: boolean) {
  const read = (path: string): unknown =>
    committed
      ? JSON.parse(
          execFileSync('git', ['show', `HEAD:${path}`], {
            cwd: root,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
          }),
        )
      : readJson(path);
  return parseEvidence({
    sources: read(paths.sources),
    reviews: read(paths.reviews),
    profileReviews: read(paths.profileReviews),
    provenance: read(paths.provenance),
  });
}

function writePrivate(name: string, value: unknown) {
  const path = resolve(root, 'private-data/intake', name);
  const body = JSON.stringify(value, null, 2) + '\n';
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  if (existsSync(path)) {
    if (readFileSync(path, 'utf8') === body) return path;
    throw new Error(
      'Output already exists with different content. Use a new batch ID; nothing was overwritten.',
    );
  }
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, body, { flag: 'wx', mode: 0o600 });
    renameSync(temporary, path);
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
  return path;
}

const stagedSchema = z.strictObject({
  stageVersion: z.literal('1.0'),
  state: z.literal('staged'),
  batch: intakeBatchSchema,
  questions: z.array(
    z.strictObject({
      questionId: auditId,
      candidateDigest: digest,
      questionDigest: digest,
      normalizationCorrections: z.array(normalizationChangeSchema),
    }),
  ),
  possibleDuplicates: z.array(
    z.strictObject({
      questionId: auditId,
      otherQuestionId: auditId,
      reason: z.string(),
    }),
  ),
});

try {
  const [command, input, ...extra] = process.argv.slice(2);
  if (
    extra.length ||
    !['check', 'validate', 'stage', 'inspect', 'promote'].includes(
      command ?? '',
    ) ||
    (command === 'check' ? input !== undefined : !input)
  )
    throw new Error(
      'Usage: npm run intake -- check | validate INPUT.json | stage INPUT.json | inspect STAGED.json | promote STAGED.json',
    );
  const catalog = z
    .array(verifiedPyqSchema)
    .parse(readJson('src/data/question-bank/verified-pyqs.json'));
  const evidence = loadEvidence(command === 'promote' || command === 'inspect');
  assertCatalogTraceability(catalog, evidence);
  checkPublishedCatalog(catalog, evidence.provenance, evidence);
  if (command === 'check') {
    const profiles = checkReferenceProfiles(
      readJson('src/data/exam-profiles/profiles.json'),
      { sources: evidence.sources, reviews: evidence.profileReviews },
    );
    if (evidence.sources.some((s) => !s.permission.publicMetadataAllowed))
      throw new Error(
        'Public source ledger contains metadata not cleared for publication.',
      );
    console.log(
      JSON.stringify({
        status: 'valid',
        approvedPyqs: catalog.length,
        publicSources: evidence.sources.length,
        approvedQuestionReviews: evidence.reviews.filter(
          (r) => r.decision === 'approved',
        ).length,
        verifiedReferenceProfiles: profiles.verified().length,
        profile2027: profiles.readiness(2027),
      }),
    );
  } else if (command === 'validate' || command === 'stage') {
    const staged = stageIntake(readJson(input!), catalog);
    const path =
      command === 'stage'
        ? writePrivate(`${staged.batch.batchId}.staged.json`, staged)
        : undefined;
    console.log(
      JSON.stringify({
        status: 'staged-unreviewed',
        batchId: staged.batch.batchId,
        candidateCount: staged.batch.candidates.length,
        possibleDuplicates: staged.possibleDuplicates,
        ...(path ? { path } : {}),
      }),
    );
  } else {
    const file = stagedSchema.parse(readJson(input!));
    const staged = stageIntake(file.batch, catalog);
    if (JSON.stringify(staged.questions) !== JSON.stringify(file.questions))
      throw new Error(
        'Staged fingerprints/corrections do not match the content. Restage and re-review.',
      );
    if (command === 'inspect')
      console.log(
        JSON.stringify(
          {
            batchId: staged.batch.batchId,
            questions: staged.questions.map((q) => ({
              ...q,
              normalizationCorrections: correctionProofs(
                q.normalizationCorrections,
              ),
            })),
            sourceDigests: evidence.sources.map((source) => ({
              sourceId: source.id,
              sourceDigest: fingerprint(source),
            })),
            possibleDuplicates: staged.possibleDuplicates,
          },
          null,
          2,
        ),
      );
    else {
      const output = promoteIntake(
        staged.batch,
        evidence,
        catalog,
        evidence.provenance,
      );
      checkPublishedCatalog(output.questions, output.provenance, evidence);
      const reviewedAtCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: root,
        encoding: 'utf8',
      }).trim();
      const path = writePrivate(`${staged.batch.batchId}.approved.json`, {
        catalogVersion: '1.0',
        reviewedAtCommit,
        ...output,
      });
      console.log(
        JSON.stringify({
          status: 'approved-output-generated',
          questionCount: output.questions.length,
          path,
          runtimeCatalog:
            'unchanged; install arrays only as an explicit reviewed repository edit, then run intake:check',
        }),
      );
    }
  }
} catch (error) {
  if (error instanceof z.ZodError)
    for (const issue of error.issues)
      console.error(`${issue.path.join('.') || 'input'}: ${issue.message}`);
  else
    console.error(
      error instanceof Error ? error.message : 'Intake validation failed.',
    );
  process.exitCode = 1;
}
