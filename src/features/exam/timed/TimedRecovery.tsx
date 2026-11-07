import { useTimedPracticeStore } from '../../../stores/timed-practice-store';

export function TimedRecovery() {
  const error = useTimedPracticeStore((s) => s.recoveryError);
  const reset = useTimedPracticeStore((s) => s.reset);
  return (
    <section
      className="panel demo-instructions"
      aria-label="Timed practice recovery"
    >
      <h1>Saved practice unavailable</h1>
      <p role="alert" className="editor-help">
        {error}
      </p>
      <p className="editor-help">
        Reset removes only this application’s latest timed-practice record, not
        other browser data.
      </p>
      <button className="secondary-button" onClick={reset}>
        Reset local timed practice
      </button>
    </section>
  );
}
