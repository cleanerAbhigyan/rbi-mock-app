import { Link } from 'react-router-dom';
import { PatternNotice } from '../../components/ui/PatternNotice';
import { useQuestionBankStore } from '../../stores/question-bank-store';
import { demoQuestions } from './demo-profile';

const examOptions = [
  {
    number: '01',
    title: 'RBI Grade B — Phase I',
    detail:
      'Source-verified full exam profiles are planned. Try a separate custom demo above.',
    label: 'Phase I practice',
  },
  {
    number: '02',
    title: 'RBI Grade B — Phase II',
    detail: 'Objective and descriptive paper practice, planned for later.',
    label: 'Phase II practice',
  },
  {
    number: '03',
    title: 'Sectional Practice',
    detail: 'Focused practice for individual subjects and skills.',
    label: 'Sectional practice',
  },
];

export function Dashboard() {
  const questionCount = useQuestionBankStore(
    (state) => state.verifiedPyqs.length,
  );

  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Your practice, with a clear foundation</p>
        <h1>RBI Grade B Mock Exam Simulator</h1>
        <p className="page-description">
          Independent computer-based examination practice application
        </p>
      </div>
      <PatternNotice />
      <section
        className="demo-entry panel"
        aria-labelledby="timed-entry-heading"
      >
        <div>
          <p className="eyebrow">
            CUSTOM TIMED PRACTICE — NOT OFFICIAL RBI EXAM PATTERN
          </p>
          <h2 id="timed-entry-heading">Try a timed custom mock</h2>
          <p>
            12 original demo questions, sequential section deadlines, refresh
            recovery, submission and scored review.
          </p>
        </div>
        <Link className="primary-button" to="/demo/timed/instructions">
          Try Timed Practice
        </Link>
      </section>
      <section
        className="demo-entry panel"
        aria-labelledby="demo-entry-heading"
      >
        <div>
          <p className="eyebrow">DEMO PRACTICE — NOT ACTUAL RBI PYQs</p>
          <h2 id="demo-entry-heading">Try the Phase I candidate interface</h2>
          <p>
            {demoQuestions.length} original demo questions across four sections.
            Practice saving and reviewing answers — untimed and unscored.
          </p>
        </div>
        <Link className="primary-button" to="/demo/instructions">
          Try Phase I Demo
        </Link>
      </section>
      <div className="dashboard-grid">
        <div className="space-y-8">
          <section aria-labelledby="exam-options-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Build your preparation</p>
                <h2 id="exam-options-heading">Choose your practice</h2>
              </div>
              <span className="quiet-label">Planned capabilities</span>
            </div>
            <div className="exam-options">
              {examOptions.map((option) => (
                <article className="exam-card" key={option.number}>
                  <span className="option-number" aria-hidden="true">
                    {option.number}
                  </span>
                  <div className="exam-card-content">
                    <h3>{option.title}</h3>
                    <p>{option.detail}</p>
                    <span className="planned-label">Not implemented</span>
                  </div>
                  <button
                    type="button"
                    disabled
                    aria-label={`${option.label} — not implemented`}
                  >
                    Unavailable
                  </button>
                </article>
              ))}
            </div>
          </section>
          <section
            className="panel bank-preview"
            aria-labelledby="bank-heading"
          >
            <div>
              <p className="eyebrow">Quality before quantity</p>
              <h2 id="bank-heading">A source you can trust</h2>
              <p>
                {questionCount === 0
                  ? 'No verified PYQs imported yet.'
                  : `${questionCount} verified PYQs available.`}
              </p>
              <p className="muted">
                Only source-attributed, verified and approved questions belong
                in this catalog.
              </p>
              <Link className="text-link" to="/question-bank">
                View question bank <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="bank-count">
              <strong>{questionCount}</strong>
              <span>verified PYQs</span>
            </div>
          </section>
        </div>
        <aside className="readiness-panel" aria-labelledby="readiness-heading">
          <span className="foundation-badge">PHASE 1B</span>
          <h2 id="readiness-heading">A deliberate start.</h2>
          <p>
            Untimed interaction and timed custom practice are ready. Verified
            exam content comes next.
          </p>
          <ol className="milestones">
            <li>
              <span className="step-icon complete" aria-hidden="true">
                ✓
              </span>
              <div>
                <h3>Project foundation</h3>
                <p>Dashboard, data validation and core contracts.</p>
                <span className="step-state">Available now</span>
              </div>
            </li>
            <li>
              <span className="step-icon" aria-hidden="true">
                2
              </span>
              <div>
                <h3>Phase I experience</h3>
                <p>Custom demo timing, saved answers, submission and review.</p>
                <span className="step-state">
                  Untimed and timed demos available
                </span>
              </div>
            </li>
            <li>
              <span className="step-icon" aria-hidden="true">
                3
              </span>
              <div>
                <h3>Verified question bank</h3>
                <p>Human-reviewed sources and answer keys.</p>
                <span className="step-state">Awaiting approved content</span>
              </div>
            </li>
          </ol>
          <div className="readiness-note">
            No real-PYQ mock history or performance analytics are populated.
          </div>
        </aside>
      </div>
    </>
  );
}
