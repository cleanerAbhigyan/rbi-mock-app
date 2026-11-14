import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { intakeFixture } from './fixtures/intake';

const temporary = mkdtempSync(resolve(tmpdir(), 'rbi-intake-tests-'));
const outputs: string[] = [];
afterEach(() => {
  for (const path of outputs.splice(0)) if (existsSync(path)) rmSync(path);
});
const cli = (...args: string[]) => {
  const result = spawnSync(process.execPath, ['scripts/intake.ts', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  return result;
};

describe('local operator CLI', () => {
  it('checks the actual empty public catalog and profile registries', () => {
    const result = cli('check');
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      status: 'valid',
      approvedPyqs: 0,
      publicSources: 0,
      verifiedReferenceProfiles: 0,
      profile2027: 'awaiting-official-notification',
    });
  });
  it('stages privately but refuses synthetic self-approval without changing public catalog bytes', () => {
    const { batch } = intakeFixture();
    batch.batchId = `synthetic-cli-${randomUUID()}`;
    const input = resolve(temporary, `${batch.batchId}.json`);
    outputs.push(input);
    writeFileSync(input, JSON.stringify(batch));
    const catalogPath = 'src/data/question-bank/verified-pyqs.json';
    const tracePath = 'src/data/source-review/catalog-provenance.json';
    const before = [
      readFileSync(catalogPath, 'utf8'),
      readFileSync(tracePath, 'utf8'),
    ];
    const result = cli('stage', input);
    expect(result.status, result.stderr).toBe(0);
    const output = JSON.parse(result.stdout);
    outputs.push(output.path);
    expect(output.status).toBe('staged-unreviewed');
    expect(output.path).toContain('private-data/intake/');
    expect(result.stdout).not.toContain(batch.candidates[0]!.question.text);
    expect(JSON.parse(readFileSync(output.path, 'utf8')).state).toBe('staged');
    const approvedPath = output.path.replace('.staged.json', '.approved.json');
    outputs.push(approvedPath);
    const denied = cli('promote', output.path);
    expect(denied.status).toBe(1);
    expect(existsSync(approvedPath)).toBe(false);
    expect([
      readFileSync(catalogPath, 'utf8'),
      readFileSync(tracePath, 'utf8'),
    ]).toEqual(before);
  });
  it('rejects the complete bad batch without writing partial staging or approved output', () => {
    const { batch, evidence } = intakeFixture();
    batch.batchId = `synthetic-bad-${randomUUID()}`;
    const input = resolve(temporary, `${batch.batchId}.json`);
    outputs.push(input);
    writeFileSync(
      input,
      JSON.stringify({ ...batch, reviews: evidence.reviews }),
    );
    const staged = resolve(
      'private-data/intake',
      `${batch.batchId}.staged.json`,
    );
    expect(cli('stage', input).status).toBe(1);
    expect(existsSync(staged)).toBe(false);
    expect(cli('validate', input).status).toBe(1);
    expect(cli('check', input).status).toBe(1);
  });
});
