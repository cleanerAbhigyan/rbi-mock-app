import type { ExamSection } from '../../../types/exam';
import { countQuestionStatuses, deriveQuestionStatus } from '../demo-session';
import type { DemoSession } from '../demo-session';
import { PaletteLegend } from './PaletteLegend';
import { paletteStates } from './palette-states';

export function QuestionPalette({
  session,
  section,
  onNavigate,
}: {
  session: DemoSession;
  section: ExamSection;
  onNavigate: (id: string) => void;
}) {
  const counts = countQuestionStatuses(session, section.questionIds);
  return (
    <aside className="panel question-palette" aria-label="Question palette">
      <h2>Question palette</h2>
      <p className="palette-help">
        {section.title} · {section.questionIds.length} questions
      </p>
      <div className="palette-buttons">
        {section.questionIds.map((id, index) => {
          const status = deriveQuestionStatus(session, id);
          const active = id === session.activeQuestionId;
          return (
            <button
              type="button"
              key={id}
              className={`palette-button status-${status}${active ? ' is-active' : ''}`}
              aria-label={`Question ${index + 1} — ${paletteStates[status].label}`}
              aria-current={active ? 'step' : undefined}
              onClick={() => onNavigate(id)}
            >
              <span>{index + 1}</span>
              <small aria-hidden="true">{paletteStates[status].symbol}</small>
            </button>
          );
        })}
      </div>
      <p className="palette-help">
        Outlined question = current question. Draft choices are not counted as
        answers.
      </p>
      <PaletteLegend counts={counts} />
    </aside>
  );
}
