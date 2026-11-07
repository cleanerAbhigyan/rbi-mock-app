import { Link } from 'react-router-dom';
import { PatternNotice } from '../../components/ui/PatternNotice';
import { useQuestionBankStore } from '../../stores/question-bank-store';

export function QuestionBankPage() {
  const questions = useQuestionBankStore((state) => state.verifiedPyqs);
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Reviewed sources. Explicit provenance.</p>
        <h1>Question bank</h1>
        <p className="page-description">
          An honest catalog of approved, verified previous-year questions.
        </p>
      </div>
      <PatternNotice />
      <section
        className="panel catalog-panel"
        aria-labelledby="catalog-heading"
      >
        <div className="section-heading">
          <h2 id="catalog-heading">Verified PYQ catalog</h2>
          <span className="count-label">{questions.length} verified PYQs</span>
        </div>
        {questions.length === 0 ? (
          <div className="empty-state">
            <span className="empty-symbol" aria-hidden="true">
              ∅
            </span>
            <h3>No verified PYQs imported yet.</h3>
            <p>
              Questions will appear after their original sources, answer keys
              and scoring rules have been reviewed and approved.
            </p>
            <p className="muted">
              Synthetic developer fixtures are kept separate and are never
              counted here.
            </p>
          </div>
        ) : (
          <ul className="catalog-list">
            {questions.map((question) => (
              <li key={question.id}>
                <h3>
                  {question.paperOrSection} · {question.year}
                </h3>
                <p>
                  {question.id} · revision {question.revision}
                </p>
                <p>Verified actual PYQ · source: {question.source.reference}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section
        className="source-policy"
        aria-labelledby="source-policy-heading"
      >
        <h2 id="source-policy-heading">Every source keeps its identity</h2>
        <p>
          Memory-based and coaching reconstructions, original practice and
          LLM-generated practice remain distinct from actual verified PYQs. A
          year label or file location does not establish authenticity.
        </p>
        <Link className="text-link" to="/">
          Back to dashboard <span aria-hidden="true">→</span>
        </Link>
      </section>
    </>
  );
}
