import { Link, Navigate } from 'react-router-dom';
import { useTimedPracticeStore } from '../../../stores/timed-practice-store';
import { demoScoringRepository } from '../../../data/demo/demo-scoring-repository';
import { scoreSubmittedAttempt } from './scoring';
import { useTimedLifecycle } from './use-timed-lifecycle';
import { TimedRecovery } from './TimedRecovery';

export function TimedResults() {
  useTimedLifecycle();
  const { attempt, hydrated, recoveryError, storageWarning } =
    useTimedPracticeStore();
  if (!hydrated) return <p>Restoring latest result…</p>;
  if (recoveryError) return <TimedRecovery />;
  if (!attempt) return <Navigate to="/demo/timed/instructions" replace />;
  if (attempt.status !== 'submitted')
    return <Navigate to="/demo/timed/exam" replace />;
  const result = scoreSubmittedAttempt(
    attempt,
    demoScoringRepository.listScoringRecords(),
  );
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">
          CUSTOM TIMED PRACTICE — NOT OFFICIAL RBI EXAM PATTERN
        </p>
        <h1>Timed practice results</h1>
        <p className="page-description">
          Original demo material, not actual RBI PYQs. No official cutoff, rank
          or qualification is inferred.
        </p>
        <p>
          Submission:{' '}
          {attempt.submissionReason === 'manual' ? 'Manual' : 'Time expiry'} ·{' '}
          {new Date(attempt.submittedAtMs!).toLocaleString()}
        </p>
      </div>
      {storageWarning ? <p role="alert">{storageWarning}</p> : null}
      <section className="panel results-summary" aria-label="Result summary">
        <h2>
          Score: {result.score} / {result.maximumMarks}
        </h2>
        <dl>
          {Object.entries({
            Attempted: result.attempted,
            Correct: result.correct,
            Incorrect: result.incorrect,
            Unanswered: result.unanswered,
            Accuracy: `${result.accuracy}%`,
          }).map(([name, value]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="panel result-breakdown">
        <h2>Section-wise breakdown</h2>
        <p className="editor-help">
          On narrow screens, scroll the table horizontally to see all counts.
        </p>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">
              Section scores and answer counts
            </caption>
            <thead>
              <tr>
                <th scope="col">Section</th>
                <th scope="col">Score / max</th>
                <th scope="col">Attempted</th>
                <th scope="col">Correct</th>
                <th scope="col">Incorrect</th>
                <th scope="col">Unanswered</th>
              </tr>
            </thead>
            <tbody>
              {result.sections.map((s) => (
                <tr key={s.id}>
                  <th scope="row">{s.title}</th>
                  <td>
                    {s.score} / {s.maximumMarks}
                  </td>
                  <td>{s.attempted}</td>
                  <td>{s.correct}</td>
                  <td>{s.incorrect}</td>
                  <td>{s.unanswered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="solution-review" aria-labelledby="review-heading">
        <h2 id="review-heading">Saved answers and solutions</h2>
        {result.questions.map((q, i) => (
          <article className="panel solution-card" key={q.id}>
            <h3>
              {i + 1}. {q.text}
            </h3>
            <p className={`outcome outcome-${q.outcome}`}>
              {q.outcome === 'unanswered'
                ? 'Unanswered'
                : q.outcome === 'correct'
                  ? 'Correct'
                  : 'Incorrect'}{' '}
              · {q.score} marks
              {attempt.session.reviewFlags[q.id] === 'marked-for-review'
                ? ' · Marked for review'
                : ''}
            </p>
            <p>
              Your saved answer:{' '}
              {q.options.find((o) => o.id === q.selectedOptionId)?.text ??
                'No saved answer'}
            </p>
            <p>
              Correct answer:{' '}
              {q.options.find((o) => o.id === q.correctOptionId)!.text}
            </p>
            <p>Explanation: {q.explanation}</p>
          </article>
        ))}
      </section>
      <Link className="text-link" to="/demo/timed/instructions">
        Timed practice instructions / begin another →
      </Link>
    </>
  );
}
