import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PatternNotice } from '../../components/ui/PatternNotice';
import { useDemoSessionStore } from '../../stores/demo-session-store';
import { demoProfile, demoQuestions } from './demo-profile';
import { PaletteLegend } from './components/PaletteLegend';

export function DemoInstructions() {
  const [agreed, setAgreed] = useState(false);
  const beginDemo = useDemoSessionStore((state) => state.beginDemo);
  const navigate = useNavigate();
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">DEMO PRACTICE — NOT ACTUAL RBI PYQs</p>
        <h1>Phase I demo instructions</h1>
        <p className="page-description">
          Read the controls before trying the candidate interface.
        </p>
      </div>
      <PatternNotice />
      <section
        className="panel demo-instructions"
        aria-labelledby="demo-profile-heading"
      >
        <h2 id="demo-profile-heading">{demoProfile.label}</h2>
        <p className="demo-summary">
          {demoQuestions.length} original demo questions · 4 sections · Untimed
          · Unscored
        </p>
        <ul className="instruction-sections">
          {demoProfile.sections.map((section) => (
            <li key={section.id}>
              {section.title} — {section.questionIds.length} questions
            </li>
          ))}
        </ul>
        <div className="instruction-grid">
          <section aria-labelledby="controls-heading">
            <h2 id="controls-heading">How responses work</h2>
            <ul className="instruction-list">
              <li>
                Selecting an option creates an <strong>unsaved draft</strong>.
                It does not count as answered.
              </li>
              <li>
                <strong>Save &amp; Next</strong> commits the selection and opens
                the next question. Without a selection, it advances without
                saving an answer. It keeps any review flag.
              </li>
              <li>
                <strong>Mark for Review &amp; Next</strong> saves the selection
                if present, marks the question and advances. Without an answer,
                only the review flag is set.
              </li>
              <li>
                <strong>
                  Previous Question, Next Question, palette buttons and section
                  tabs
                </strong>{' '}
                navigate without saving. Unsaved edits are discarded; the
                previous committed answer is restored on return. Section tabs
                open that section’s first question.
              </li>
              <li>
                <strong>Clear Response</strong> removes the active draft and
                saved response. Any review flag remains until you use{' '}
                <strong>Remove Review Flag</strong>, which preserves the answer.
              </li>
              <li>
                Previous/Next cross section boundaries. At the final question,
                save and review actions stay on that question; nothing is
                submitted.
              </li>
            </ul>
          </section>
          <section aria-labelledby="palette-legend-heading">
            <h2 id="palette-legend-heading">Question-palette states</h2>
            <PaletteLegend />
            <p className="editor-help">
              Status reflects visits, saved responses and review flags, never an
              unsaved selection.
            </p>
          </section>
        </div>
        <aside className="demo-limitations" aria-label="Demo limitations">
          <h2>Interaction demo only</h2>
          <p>
            No timer, section locks, final submission, scoring, results or saved
            history. Answers and explanations stay hidden. Refreshing clears the
            in-memory session. Beginning again starts fresh.
          </p>
          <p>
            Independent personal practice, not official RBI or IBPS software.
            This custom profile does not represent an official 2027 examination
            pattern.
          </p>
        </aside>
        <form
          className="begin-demo-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!agreed) return;
            beginDemo();
            navigate('/demo/exam');
          }}
        >
          <label className="instruction-agreement">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              required
            />
            I have read and understood the instructions.
          </label>
          <button type="submit" className="primary-button" disabled={!agreed}>
            Begin Demo
          </button>
        </form>
        <Link className="text-link" to="/">
          Back to dashboard →
        </Link>
      </section>
    </>
  );
}
