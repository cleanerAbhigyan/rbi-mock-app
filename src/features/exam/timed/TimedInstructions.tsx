import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PatternNotice } from '../../../components/ui/PatternNotice';
import { useTimedPracticeStore } from '../../../stores/timed-practice-store';
import { timedContext } from './profile';
import { useTimedLifecycle } from './use-timed-lifecycle';
import { TimedRecovery } from './TimedRecovery';

export function TimedInstructions() {
  useTimedLifecycle();
  const state = useTimedPracticeStore();
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  if (!state.hydrated) return <p>Checking saved practice…</p>;
  if (state.recoveryError) return <TimedRecovery />;
  const { profile, questions } = timedContext;
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">
          CUSTOM TIMED PRACTICE — NOT OFFICIAL RBI EXAM PATTERN
        </p>
        <h1>Timed practice instructions</h1>
        <p className="page-description">
          12 original demonstration questions — not actual RBI PYQs.
        </p>
      </div>
      <PatternNotice />
      <section className="panel demo-instructions">
        <h2>{profile.label}</h2>
        <p className="demo-summary">
          {questions.length} questions ·{' '}
          {profile.sections.reduce((total, s) => total + s.durationSeconds, 0) /
            60}{' '}
          minutes total · Sequential locked sections
        </p>
        <ol className="instruction-list">
          {profile.sections.map((section) => (
            <li key={section.id}>
              {section.title}: {section.durationSeconds} seconds,{' '}
              {section.questionIds.length} questions
            </li>
          ))}
        </ol>
        <ul className="instruction-list">
          <li>
            Timing starts only on <strong>Begin Timed Mock</strong>. Sections
            open in the order above. Earlier sections lock when their deadline
            expires; future sections cannot be opened early.
          </li>
          <li>
            At section expiry, the next section opens automatically on the
            original schedule. Missing several deadlines while away does not
            grant fresh section time. The final deadline submits automatically.
          </li>
          <li>
            Selecting creates an unsaved draft. Save &amp; Next commits it; Mark
            for Review &amp; Next commits if selected and marks it. Palette and
            question navigation discard unsaved edits. Save/Next cannot leave
            the active section.
          </li>
          <li>
            Clear Response removes draft and saved answer but keeps the review
            flag. Remove Review Flag preserves the answer. Saved answers marked
            for review are scored; review flags without saved answers are
            unattempted.
          </li>
          <li>
            Custom marking:{' '}
            <strong>
              +{profile.marking.marks} for correct; −
              {profile.marking.negativeMarks} for incorrect; 0 unanswered.
            </strong>{' '}
            These are demonstration rules, not an official RBI scheme.
          </li>
          <li>
            Submit Exam opens a final confirmation. Cancel continues the
            attempt; Confirm Submission freezes saved responses. Unsaved drafts
            are never scored. Solutions appear only after final submission.
          </li>
          <li>
            The latest timed attempt is saved in this browser’s local storage.
            Refresh restores committed answers and review flags, discards
            unsaved edits, and keeps the original deadlines. Only the latest
            attempt is retained, not a history.
          </li>
          <li>
            This local-first simulator cannot prevent deliberate clock/storage
            manipulation. Use one active tab. Storage failures are displayed; do
            not rely on refresh recovery if saving fails.
          </li>
        </ul>
        {state.attempt ? (
          <div className="demo-limitations">
            <h2>
              {state.attempt.status === 'in-progress'
                ? 'A timed mock is already active'
                : 'Latest completed timed mock'}
            </h2>
            <Link
              className="primary-button"
              to={
                state.attempt.status === 'in-progress'
                  ? '/demo/timed/exam'
                  : '/demo/timed/results'
              }
            >
              {state.attempt.status === 'in-progress'
                ? 'Resume Timed Mock'
                : 'View Latest Results'}
            </Link>
            <p>
              {state.attempt.status === 'in-progress'
                ? 'Its deadlines continue while you are away. You cannot restart an active mock to reset its clock.'
                : 'Beginning another mock replaces this saved attempt and result.'}
            </p>
          </div>
        ) : null}
        {state.storageWarning ? (
          <p role="alert">{state.storageWarning}</p>
        ) : null}
        {state.attempt?.status !== 'in-progress' ? (
          <form
            className="begin-demo-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!agreed) return;
              state.begin();
              if (
                useTimedPracticeStore.getState().attempt?.status ===
                'in-progress'
              )
                navigate('/demo/timed/exam');
            }}
          >
            <label className="instruction-agreement">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
              />
              I understand the timed practice rules and local recovery limits.
            </label>
            <button className="primary-button" disabled={!agreed}>
              Begin Timed Mock
            </button>
          </form>
        ) : null}
        <Link className="text-link" to="/">
          Back to dashboard →
        </Link>
      </section>
    </>
  );
}
