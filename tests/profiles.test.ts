import { describe, expect, it } from 'vitest';
import {
  customReferenceProfileSchema,
  referenceProfileSchema,
} from '../src/schemas/exam-profile';
import { createReferenceProfileRegistry } from '../src/features/profiles/registry';
import { checkReferenceProfiles } from '../src/features/profiles/check';
import {
  referenceProfiles,
  sourceReadiness,
} from '../src/data/source-review/readiness';
import {
  customProfileFixture,
  officialProfileFixture,
} from './fixtures/intake';
import { timedProfile } from '../src/features/exam/timed/profile';

describe('independent source-backed profile framework', () => {
  it('keeps executable custom practice separate from source-verified claims', () => {
    const profile = customProfileFixture();
    const registry = createReferenceProfileRegistry([profile], {
      sources: [],
      reviews: [],
    });
    expect(registry.list()[0]!.sourceStatus).toBe('custom-practice');
    expect(registry.verified()).toEqual([]);
    expect(registry.readiness(2000)).toBe('awaiting-source-verification');
    const clone = registry.list()[0]!;
    clone.referenceLabel = 'changed';
    expect(registry.list()[0]!.referenceLabel).not.toBe('changed');
    expect(timedProfile.source.status).toBe('custom-practice');
    expect(timedProfile.sections.every((s) => s.durationSeconds === 60)).toBe(
      true,
    );
  });
  it('validates only synthetic official-reference contracts in tests with independent full-fact evidence', () => {
    const { profile, evidence } = officialProfileFixture();
    expect(checkReferenceProfiles([profile], evidence).verified()).toHaveLength(
      1,
    );
    expect(() =>
      createReferenceProfileRegistry([profile], { sources: [], reviews: [] }),
    ).toThrow(/human reference review/);
    const selfReview = structuredClone(evidence);
    selfReview.reviews[0]!.reviewer.id = profile.preparedBy;
    expect(() => checkReferenceProfiles([profile], selfReview)).toThrow(
      /independent/,
    );
    const stale = structuredClone(profile);
    stale.referenceLabel += ' changed';
    expect(() => checkReferenceProfiles([stale], evidence)).toThrow(
      /re-review/,
    );
  });
  it.each([
    'count',
    'order',
    'duration',
    'time-sum',
    'navigation',
    'penalty',
    'precision',
    'bounds',
    'override-section',
    'override-question',
    'duplicate-sections',
  ])('rejects invalid profile %s', (scenario) => {
    const profile = customProfileFixture();
    switch (scenario) {
      case 'count':
        profile.totalQuestionCount++;
        break;
      case 'order':
        profile.sections.reverse();
        break;
      case 'duration':
        profile.sections[0]!.durationSeconds = 0;
        break;
      case 'time-sum':
        profile.timing.totalDurationSeconds = 89;
        break;
      case 'navigation':
        profile.sections[0]!.navigation = 'free';
        break;
      case 'penalty':
        profile.marking.default.negativeMarks = 2;
        break;
      case 'precision':
        profile.marking.default.marks = 0.333;
        break;
      case 'bounds':
        profile.validFrom = '2001-01-01';
        profile.validUntil = '2000-01-01';
        break;
      case 'override-section':
        profile.marking.sectionOverrides.push({
          sectionId: 'missing',
          rule: { marks: 1, negativeMarks: 0 },
        });
        break;
      case 'override-question':
        profile.marking.questionOverrides.push({
          questionId: 'test-q',
          sectionId: profile.sections[0]!.id,
          questionNumber: 99,
          rule: { marks: 1, negativeMarks: 0 },
        });
        break;
      case 'duplicate-sections':
        profile.sections[1]!.id = profile.sections[0]!.id;
        break;
    }
    expect(customReferenceProfileSchema.safeParse(profile).success).toBe(false);
  });
  it('supports explicit untimed/overall allocation and valid per-section/question marking overrides', () => {
    const profile = customProfileFixture();
    profile.marking.sectionOverrides.push({
      sectionId: profile.sections[0]!.id,
      rule: { marks: 2, negativeMarks: 0.5 },
    });
    profile.marking.questionOverrides.push({
      sectionId: profile.sections[0]!.id,
      questionId: 'synthetic-item',
      questionNumber: 1,
      rule: { marks: 1, negativeMarks: 0 },
    });
    expect(customReferenceProfileSchema.safeParse(profile).success).toBe(true);
    profile.sections.forEach((s) => {
      s.durationSeconds = null;
      s.navigation = 'free';
    });
    profile.timing.mode = 'overall';
    expect(customReferenceProfileSchema.safeParse(profile).success).toBe(true);
    profile.timing.mode = 'untimed';
    profile.timing.totalDurationSeconds = null;
    expect(customReferenceProfileSchema.safeParse(profile).success).toBe(true);
    profile.marking.questionOverrides.push(
      profile.marking.questionOverrides[0]!,
    );
    expect(customReferenceProfileSchema.safeParse(profile).success).toBe(false);
  });
  it('rejects source URL/publisher/review/citation inconsistencies rather than trusting a verified label', () => {
    const { profile, evidence } = officialProfileFixture();
    expect(() =>
      checkReferenceProfiles(
        [
          {
            ...profile,
            sourceEvidence: {
              ...profile.sourceEvidence,
              officialUrl: 'https://rbi.org.in.evil.example/fake',
            },
          },
        ],
        evidence,
      ),
    ).toThrow();
    for (const mutate of [
      (p: typeof profile) => {
        p.sourceEvidence.fieldCitations.pop();
      },
      (p: typeof profile) => {
        p.sourceEvidence.publisher =
          'Other publisher' as 'Reserve Bank of India';
      },
      (p: typeof profile) => {
        p.sourceEvidence.verifiedOn = '2000-01-04';
      },
    ]) {
      const copy = structuredClone(profile);
      mutate(copy);
      expect(() => checkReferenceProfiles([copy], evidence)).toThrow();
    }
    const missingCheck = structuredClone(evidence);
    missingCheck.reviews[0]!.checkedFields.pop();
    expect(() => checkReferenceProfiles([profile], missingCheck)).toThrow(
      /every declared/,
    );
    expect(() => checkReferenceProfiles([profile, profile], evidence)).toThrow(
      /Duplicate profile/,
    );
  });
  it('represents awaiting status without guessed sections, timings, or a fabricated 2027 pattern', () => {
    const pending = {
      schemaVersion: '1.0',
      id: 'synthetic-pending-status',
      revision: 1,
      exam: 'RBI Grade B (DR-General)',
      phase: 'phase-i',
      year: 2027,
      referenceLabel: 'Pending notification',
      sourceStatus: 'awaiting-source-verification',
      pendingReason: 'awaiting-official-notification',
    };
    expect(referenceProfileSchema.safeParse(pending).success).toBe(true);
    expect(
      referenceProfileSchema.safeParse({
        ...pending,
        sections: customProfileFixture().sections,
      }).success,
    ).toBe(false);
    expect(referenceProfiles.list()).toEqual([]);
    expect(referenceProfiles.readiness(2027)).toBe(
      'awaiting-official-notification',
    );
    expect(sourceReadiness).toEqual({
      publicSources: 0,
      approvedReviews: 0,
      verifiedProfiles: 0,
    });
  });
});
