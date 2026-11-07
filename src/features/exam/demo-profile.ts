import { localDemoRepository } from '../../data/demo/local-demo-repository';
import { demoSectionNames } from '../../data/demo/demo-questions';
import type { ExamProfile } from '../../types/exam';

const candidateQuestions = localDemoRepository.listDemoQuestions();
export const demoQuestions = demoSectionNames.flatMap((section) =>
  candidateQuestions.filter((question) => question.paperOrSection === section),
);

export const demoProfile: ExamProfile = {
  id: 'phase-i-interaction-demo-v1',
  revision: 1,
  exam: 'RBI Grade B (DR-General)',
  phase: 'phase-i',
  year: null,
  label: 'Phase I interaction demo — custom practice profile',
  source: {
    status: 'custom-practice',
    reference:
      'Original synthetic demonstration; no official exam pattern or timing.',
  },
  sections: demoSectionNames.map((title, index) => ({
    id: `demo-section-${index + 1}`,
    title,
    questionIds: demoQuestions
      .filter((question) => question.paperOrSection === title)
      .map((question) => question.id),
    durationSeconds: null,
    navigation: 'free',
  })),
};
