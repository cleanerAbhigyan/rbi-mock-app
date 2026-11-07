import { timedProfileSchema } from '../../../schemas/timed-attempt';
import { demoProfile, demoQuestions } from '../demo-profile';
import type { DemoQuestion } from '../../questions/demo-question-repository';
import type { TimedProfile } from '../../../schemas/timed-attempt';

export interface TimedContext {
  profile: TimedProfile;
  questions: readonly DemoQuestion[];
}

export const timedProfile = timedProfileSchema.parse({
  ...demoProfile,
  id: 'phase-i-custom-timed-v1',
  revision: 1,
  label: 'Phase I custom timed practice',
  sections: demoProfile.sections.map((section) => ({
    ...section,
    durationSeconds: 60,
    navigation: 'sequential-locked',
  })),
  marking: { marks: 1, negativeMarks: 0.25 },
});

export const timedContext: TimedContext = {
  profile: timedProfile,
  questions: demoQuestions.map((question) => ({
    ...question,
    ...timedProfile.marking,
  })),
};
