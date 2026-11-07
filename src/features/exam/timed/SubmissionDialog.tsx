import { useEffect, useRef } from 'react';

export function SubmissionDialog({
  attempted,
  total,
  onCancel,
  onConfirm,
}: {
  attempted: number;
  total: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="submission-dialog"
      aria-labelledby="submission-title"
      aria-describedby="submission-description"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id="submission-title">Submit this timed mock?</h2>
      <p id="submission-description">
        Submission is final. Only saved responses count; unsaved changes will be
        discarded. Saved answers: {attempted}; unanswered: {total - attempted}{' '}
        of {total} questions.
      </p>
      <p>The countdown continues while this dialog is open.</p>
      <div className="response-actions">
        <button autoFocus className="secondary-button" onClick={onCancel}>
          Cancel / Continue Exam
        </button>
        <button className="primary-button" onClick={onConfirm}>
          Confirm Submission
        </button>
      </div>
    </dialog>
  );
}
