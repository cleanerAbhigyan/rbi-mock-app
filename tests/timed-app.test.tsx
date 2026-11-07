import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/app/App';
import { useTimedPracticeStore } from '../src/stores/timed-practice-store';
import { TIMED_STORAGE_KEY } from '../src/features/exam/timed/persistence';
import { timedContext } from '../src/features/exam/timed/profile';
import { runtimeDemoRecords } from '../src/data/demo/demo-questions';

function renderApp(path = '/demo/timed/instructions') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}
function user() {
  return userEvent.setup();
}
async function begin() {
  const interactions = user();
  renderApp();
  await interactions.click(screen.getByRole('checkbox'));
  await interactions.click(
    screen.getByRole('button', { name: 'Begin Timed Mock' }),
  );
  return interactions;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
  vi.setSystemTime(new Date('2026-11-07T17:00:00Z'));
  localStorage.clear();
  useTimedPracticeStore.setState({
    attempt: null,
    hydrated: false,
    recoveryError: null,
    storageWarning: null,
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value() {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value() {
      this.removeAttribute('open');
    },
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('timed candidate flow', () => {
  it('links from the dashboard, explains custom rules and gates starting on acknowledgment', async () => {
    const interactions = user();
    renderApp('/');
    await interactions.click(
      screen.getByRole('link', { name: 'Try Timed Practice' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Timed practice instructions' }),
    ).toBeVisible();
    expect(
      screen.getByText('CUSTOM TIMED PRACTICE — NOT OFFICIAL RBI EXAM PATTERN'),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Begin Timed Mock' }),
    ).toBeDisabled();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    expect(useTimedPracticeStore.getState().attempt).toBeNull();
    expect(screen.getByText(/General Awareness: 60 seconds/)).toBeVisible();
    expect(screen.getByText(/−0.25 for incorrect/)).toBeVisible();
    await interactions.click(screen.getByRole('checkbox'));
    await interactions.click(
      screen.getByRole('button', { name: 'Begin Timed Mock' }),
    );
    expect(screen.getByRole('timer')).toHaveTextContent('01:00');
    expect(
      screen.getByRole('heading', { name: 'Phase I timed practice' }),
    ).toBeVisible();
  });

  it.each(['/demo/timed/exam', '/demo/timed/results'])(
    'guards %s when there is no attempt',
    (path) => {
      renderApp(path);
      expect(
        screen.getByRole('heading', { name: 'Timed practice instructions' }),
      ).toBeVisible();
      expect(screen.queryByText(/Correct answer:/)).not.toBeInTheDocument();
    },
  );

  it('counts down from the deadline, locks sections and preserves committed past answers', async () => {
    const interactions = await begin();
    const deadline =
      useTimedPracticeStore.getState().attempt!.schedule[0]!.deadlineAtMs;
    await interactions.click(screen.getAllByRole('radio')[0]!);
    await interactions.click(
      screen.getByRole('button', { name: 'Save & Next' }),
    );
    expect(
      screen.getByRole('button', {
        name: 'English Language — Locked / upcoming',
      }),
    ).toBeDisabled();
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole('timer')).toHaveTextContent('00:48');
    expect(
      useTimedPracticeStore.getState().attempt!.schedule[0]!.deadlineAtMs,
    ).toBe(deadline);
    act(() => vi.advanceTimersByTime(48000));
    expect(
      screen.getByRole('button', {
        name: 'General Awareness — Expired / locked',
      }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'English Language — Active' }),
    ).toBeEnabled();
    expect(
      useTimedPracticeStore.getState().attempt!.session.savedResponses[
        timedContext.questions[0]!.id
      ]?.selectedOptionId,
    ).toBe('a');
    expect(screen.getByRole('timer')).toHaveTextContent('01:00');
  });

  it('manual submission requires confirmation, cancellation keeps the attempt, then results reveal solutions', async () => {
    const interactions = await begin();
    await interactions.click(screen.getAllByRole('radio')[0]!);
    await interactions.click(
      screen.getByRole('button', { name: 'Mark for Review & Next' }),
    );
    for (const record of runtimeDemoRecords)
      expect(screen.queryByText(record.explanation)).not.toBeInTheDocument();
    await interactions.click(
      screen.getByRole('button', { name: 'Submit Exam' }),
    );
    const dialog = screen.getByRole('dialog', {
      name: 'Submit this timed mock?',
    });
    expect(dialog).toHaveTextContent('Saved answers: 1; unanswered: 11');
    await interactions.click(
      within(dialog).getByRole('button', { name: 'Cancel / Continue Exam' }),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useTimedPracticeStore.getState().attempt!.status).toBe(
      'in-progress',
    );
    await interactions.click(
      screen.getByRole('button', { name: 'Submit Exam' }),
    );
    await interactions.click(
      screen.getByRole('button', { name: 'Confirm Submission' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Timed practice results' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Score: 1 / 12' }),
    ).toBeVisible();
    expect(screen.getByText(/Submission: Manual/)).toBeVisible();
    expect(
      screen.getByText(`Explanation: ${runtimeDemoRecords[0]!.explanation}`),
    ).toBeVisible();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    const submittedAt = useTimedPracticeStore.getState().attempt!.submittedAtMs;
    act(() => {
      useTimedPracticeStore.getState().dispatch({ type: 'clear' });
      vi.advanceTimersByTime(999000);
    });
    expect(useTimedPracticeStore.getState().attempt!.submittedAtMs).toBe(
      submittedAt,
    );
    expect(
      screen.getByRole('heading', { name: 'Score: 1 / 12' }),
    ).toBeVisible();
  });

  it('timeout automatically submits and dismisses an open confirmation without saving drafts', async () => {
    const interactions = await begin();
    await interactions.click(screen.getAllByRole('radio')[0]!);
    await interactions.click(
      screen.getByRole('button', { name: 'Submit Exam' }),
    );
    act(() => vi.advanceTimersByTime(240000));
    expect(
      screen.getByRole('heading', { name: 'Timed practice results' }),
    ).toBeVisible();
    expect(screen.getByText(/Submission: Time expiry/)).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Score: 0 / 12' }),
    ).toBeVisible();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      Object.keys(
        useTimedPracticeStore.getState().attempt!.session.savedResponses,
      ),
    ).toHaveLength(0);
  });

  it('refresh recovery restores saved answers/flags, drops drafts and keeps deadlines; results also recover', async () => {
    const interactions = await begin();
    await interactions.click(screen.getAllByRole('radio')[0]!);
    await interactions.click(
      screen.getByRole('button', { name: 'Mark for Review & Next' }),
    );
    await interactions.click(screen.getAllByRole('radio')[2]!);
    act(() => vi.advanceTimersByTime(15000));
    const originalDeadline =
      useTimedPracticeStore.getState().attempt!.schedule[0]!.deadlineAtMs;
    cleanup();
    useTimedPracticeStore.setState({ attempt: null, hydrated: false });
    renderApp('/demo/timed/results'); // live attempts must return to candidate, never reveal results.
    expect(
      screen.getByRole('heading', { name: 'Phase I timed practice' }),
    ).toBeVisible();
    expect(screen.getByRole('timer')).toHaveTextContent('00:45');
    expect(
      useTimedPracticeStore.getState().attempt!.schedule[0]!.deadlineAtMs,
    ).toBe(originalDeadline);
    expect(
      useTimedPracticeStore.getState().attempt!.session.draft.selectedOptionId,
    ).toBeNull();
    expect(
      screen.getByRole('button', {
        name: 'Question 1 — Answered and Marked for Review',
      }),
    ).toBeVisible();
    await interactions.click(
      screen.getByRole('button', { name: 'Submit Exam' }),
    );
    await interactions.click(
      screen.getByRole('button', { name: 'Confirm Submission' }),
    );
    cleanup();
    useTimedPracticeStore.setState({ attempt: null, hydrated: false });
    renderApp('/demo/timed/results');
    expect(
      screen.getByRole('heading', { name: 'Score: 1 / 12' }),
    ).toBeVisible();
  });

  it('explains corrupt persistence and requires explicit recovery without scoring it', async () => {
    localStorage.setItem(TIMED_STORAGE_KEY, '{broken');
    const interactions = user();
    renderApp('/demo/timed/results');
    expect(
      screen.getByRole('heading', { name: 'Saved practice unavailable' }),
    ).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent(/It was not scored/);
    expect(localStorage.getItem(TIMED_STORAGE_KEY)).toBe('{broken');
    await interactions.click(
      screen.getByRole('button', { name: 'Reset local timed practice' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Timed practice instructions' }),
    ).toBeVisible();
    expect(localStorage.getItem(TIMED_STORAGE_KEY)).toBeNull();
  });
});
