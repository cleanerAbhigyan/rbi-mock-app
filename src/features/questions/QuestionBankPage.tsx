import { Link } from 'react-router-dom';
import { PatternNotice } from '../../components/ui/PatternNotice';
import { useQuestionBankStore } from '../../stores/question-bank-store';
import {
  referenceProfiles,
  sourceReadiness,
} from '../../data/source-review/readiness';

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
        className="panel catalog-panel mt-8"
        aria-labelledby="readiness-heading"
      >
        <h2 id="readiness-heading">Source and profile readiness</h2>
        <dl className="readiness-counts">
          <div>
            <dt>Public source manifests</dt>
            <dd>{sourceReadiness.publicSources}</dd>
          </div>
          <div>
            <dt>Approved human question reviews</dt>
            <dd>{sourceReadiness.approvedReviews}</dd>
          </div>
          <div>
            <dt>Verified official reference profiles</dt>
            <dd>{sourceReadiness.verifiedProfiles}</dd>
          </div>
        </dl>
        <p className="editor-help">
          {referenceProfiles.readiness(2027) ===
          'awaiting-official-notification'
            ? '2027 profile: awaiting official notification.'
            : '2027 profile: see reviewed registry evidence.'}{' '}
          Historical reference profiles await source verification when no
          matching reviewed entry exists.
        </p>
        <h3 className="mt-5">Local operator workflow</h3>
        <ol className="instruction-list">
          <li>
            Validate and stage locally supplied JSON using{' '}
            <code>npm run intake -- stage INPUT.json</code>. Private staged
            extracts are not loaded by this browser.
          </li>
          <li>
            A separate human reviewer checks the original source, answer key,
            scoring, ambiguities and redistribution permission. Imported
            approval flags cannot grant approval.
          </li>
          <li>
            Promotion requires the fixed, committed review ledger. Generate
            reviewed output locally, then explicitly review any catalog edit and
            run <code>npm run intake:check</code>.
          </li>
        </ol>
        <p className="editor-help">
          This view is read-only. No paper was imported just because a research
          folder exists. Human artifacts document a procedure; software cannot
          prove historical authenticity or legal permission.
        </p>
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
