import { useId } from 'react';
import type { DemoQuestion } from '../../questions/demo-question-repository';
import type { DemoCommand, DemoSession } from '../demo-session';

export function QuestionEditor({
  question,
  session,
  sectionNumber,
  globalIndex,
  totalQuestions,
  dispatch,
}: {
  question: DemoQuestion;
  session: DemoSession;
  sectionNumber: number;
  globalIndex: number;
  totalQuestions: number;
  dispatch: (action: DemoCommand) => void;
}) {
  const radioGroupId = useId();
  const savedOption =
    session.savedResponses[question.id]?.selectedOptionId ?? null;
  const hasUnsavedChanges = savedOption !== session.draft.selectedOptionId;
  const marked = session.reviewFlags[question.id] === 'marked-for-review';
  const last = globalIndex === totalQuestions - 1;

  return (
    <section className="panel question-editor" aria-label="Active question">
      <div className="question-meta">
        <span>Question {sectionNumber}</span>
        <span>Demo marks: {question.marks ?? 'not set'} · Unscored</span>
      </div>
      <h2 id="question-text">{question.text}</h2>
      <fieldset className="answer-options" aria-describedby="response-state">
        <legend className="sr-only">
          Select an answer for question {sectionNumber}
        </legend>
        {question.options.map((option) => (
          <label
            key={option.id}
            className={`answer-option${session.draft.selectedOptionId === option.id ? ' is-selected' : ''}`}
          >
            <input
              type="radio"
              name={`${radioGroupId}-${question.id}`}
              value={option.id}
              checked={session.draft.selectedOptionId === option.id}
              onChange={() => dispatch({ type: 'select', optionId: option.id })}
            />
            <span className="option-letter" aria-hidden="true">
              {option.id.toUpperCase()}.
            </span>
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
      <p
        id="response-state"
        className={`response-state${hasUnsavedChanges ? ' has-draft' : ''}`}
        role="status"
      >
        {hasUnsavedChanges
          ? 'Unsaved draft — save to commit this selection.'
          : savedOption
            ? 'Saved response — this selection is committed.'
            : 'No saved response for this question.'}
        {marked ? ' Marked for review.' : ''}
      </p>
      <p className="editor-help">
        Moving to another question or section discards unsaved changes. Clear
        Response removes both the draft and saved answer, keeping any review
        flag.
      </p>
      <div className="response-actions">
        <button
          type="button"
          className="secondary-button"
          disabled={
            session.draft.selectedOptionId === null && savedOption === null
          }
          onClick={() => dispatch({ type: 'clear' })}
        >
          Clear Response
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={!marked}
          onClick={() => dispatch({ type: 'remove-review' })}
        >
          Remove Review Flag
        </button>
      </div>
      <div className="exam-bottom-controls">
        <div className="question-navigation">
          <button
            type="button"
            className="secondary-button"
            disabled={globalIndex === 0}
            onClick={() => dispatch({ type: 'move', direction: -1 })}
          >
            Previous Question
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={last}
            onClick={() => dispatch({ type: 'move', direction: 1 })}
          >
            Next Question
          </button>
        </div>
        <div className="commit-actions">
          <button
            type="button"
            className="review-button"
            onClick={() => dispatch({ type: 'review-and-next' })}
          >
            Mark for Review &amp; Next
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => dispatch({ type: 'save-and-next' })}
          >
            Save &amp; Next
          </button>
        </div>
      </div>
      {last ? (
        <p className="last-question-note">
          Last question. Save and review actions stay here; this demo has no
          submission.
        </p>
      ) : null}
    </section>
  );
}
