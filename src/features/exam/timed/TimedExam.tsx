import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTimedPracticeStore } from '../../../stores/timed-practice-store';
import { QuestionEditor } from '../components/QuestionEditor';
import { QuestionPalette } from '../components/QuestionPalette';
import { timedContext } from './profile';
import { remainingSectionMs } from './engine';
import { useTimedLifecycle } from './use-timed-lifecycle';
import { TimedRecovery } from './TimedRecovery';
import { SubmissionDialog } from './SubmissionDialog';

function formatRemaining(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function TimedExam() {
  useTimedLifecycle();
  const { attempt, hydrated, recoveryError, storageWarning, dispatch } =
    useTimedPracticeStore();
  const [confirming, setConfirming] = useState(false);
  useEffect(
    () => () =>
      useTimedPracticeStore.getState().dispatch({ type: 'discard-draft' }),
    [],
  );
  if (!hydrated) return <p>Restoring timed practice…</p>;
  if (recoveryError) return <TimedRecovery />;
  if (!attempt) return <Navigate to="/demo/timed/instructions" replace />;
  if (attempt.status === 'submitted')
    return <Navigate to="/demo/timed/results" replace />;
  const section = attempt.profileSnapshot.sections[attempt.activeSectionIndex]!;
  const question = timedContext.questions.find(
    (q) => q.id === attempt.session.activeQuestionId,
  )!;
  const index = section.questionIds.indexOf(question.id);
  const remaining = remainingSectionMs(attempt, attempt.lastObservedAtMs);
  return (
    <div className="demo-exam">
      <header className="exam-header">
        <div>
          <p className="demo-label">
            CUSTOM TIMED PRACTICE — NOT OFFICIAL RBI EXAM PATTERN
          </p>
          <h1>Phase I timed practice</h1>
          <p>Original demo material — not actual RBI PYQs.</p>
          <p className="exam-progress" role="status">
            {section.title} · Question {index + 1} of{' '}
            {section.questionIds.length}
          </p>
        </div>
        <div
          className="countdown"
          role="timer"
          aria-label="Section time remaining"
        >
          <strong>{formatRemaining(remaining)}</strong>
          <span>minutes:seconds remaining</span>
        </div>
      </header>
      <div className="timed-sections" role="group" aria-label="Timed sections">
        {attempt.profileSnapshot.sections.map((s, i) => (
          <button
            type="button"
            className="secondary-button"
            key={s.id}
            disabled={i !== attempt.activeSectionIndex}
            aria-current={i === attempt.activeSectionIndex ? 'step' : undefined}
            onClick={() =>
              dispatch({ type: 'navigate', questionId: s.questionIds[0]! })
            }
          >
            {s.title} —{' '}
            {i < attempt.activeSectionIndex
              ? 'Expired / locked'
              : i > attempt.activeSectionIndex
                ? 'Locked / upcoming'
                : 'Active'}
          </button>
        ))}
      </div>
      <p className="timing-notice" role="status">
        Section {attempt.activeSectionIndex + 1} of {attempt.schedule.length}.
        Expired sections stay locked. Unsaved drafts are discarded at expiry;
        the final deadline submits automatically.
      </p>
      {storageWarning ? (
        <p role="alert" className="timing-notice">
          {storageWarning}
        </p>
      ) : null}
      <div className="candidate-grid">
        <QuestionEditor
          question={question}
          session={attempt.session}
          sectionNumber={index + 1}
          globalIndex={index}
          totalQuestions={section.questionIds.length}
          dispatch={(command) =>
            dispatch({ ...command, editorQuestionId: question.id })
          }
          timed
        />
        <QuestionPalette
          session={attempt.session}
          section={section}
          onNavigate={(questionId) =>
            dispatch({
              type: 'navigate',
              questionId,
              editorQuestionId: question.id,
            })
          }
        />
      </div>
      <div className="timed-submit">
        <p>
          Only saved answers will be scored. Solutions stay hidden until
          submission.
        </p>
        <button className="primary-button" onClick={() => setConfirming(true)}>
          Submit Exam
        </button>
      </div>
      {confirming ? (
        <SubmissionDialog
          attempted={Object.keys(attempt.session.savedResponses).length}
          total={attempt.questionSnapshots.length}
          onCancel={() => setConfirming(false)}
          onConfirm={() => dispatch({ type: 'submit' })}
        />
      ) : null}
    </div>
  );
}
