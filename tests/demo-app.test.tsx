import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../src/app/App';
import { demoProfile, demoQuestions } from '../src/features/exam/demo-profile';
import { runtimeDemoRecords } from '../src/data/demo/demo-questions';
import { useDemoSessionStore } from '../src/stores/demo-session-store';

const firstId = demoQuestions[0]!.id;
function renderApp(path = '/') {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </StrictMode>,
  );
}
function renderExam() {
  useDemoSessionStore.getState().beginDemo();
  return renderApp('/demo/exam');
}
function questionButton(number: number, status: string) {
  return screen.getByRole('button', { name: `Question ${number} — ${status}` });
}

beforeEach(() => useDemoSessionStore.setState({ session: null }));

describe('Phase 1A candidate experience', () => {
  it('links the dashboard to complete instructions and gates Begin Demo on agreement', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('link', { name: 'Try Phase I Demo' }));
    expect(
      screen.getByRole('heading', { name: 'Phase I demo instructions' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: demoProfile.label }),
    ).toBeVisible();
    expect(
      screen.getByText(
        '12 original demo questions · 4 sections · Untimed · Unscored',
      ),
    ).toBeVisible();
    for (const section of demoProfile.sections)
      expect(screen.getByText(`${section.title} — 3 questions`)).toBeVisible();
    expect(
      screen.getByRole('list', { name: 'Question status legend' }).children,
    ).toHaveLength(5);
    expect(
      screen.getByRole('heading', { name: 'How responses work' }),
    ).toBeVisible();
    expect(screen.getByLabelText('Demo limitations')).toHaveTextContent(
      /No timer, section locks, final submission, scoring/,
    );
    expect(screen.getByLabelText('Demo limitations')).toHaveTextContent(
      /not official RBI or IBPS/,
    );
    const begin = screen.getByRole('button', { name: 'Begin Demo' });
    expect(begin).toBeDisabled();
    await user.click(begin);
    expect(useDemoSessionStore.getState().session).toBeNull();
    await user.click(
      screen.getByRole('checkbox', {
        name: 'I have read and understood the instructions.',
      }),
    );
    expect(begin).toBeEnabled();
    await user.click(begin);
    expect(
      screen.getByRole('heading', { name: 'RBI Grade B Phase I — Demo' }),
    ).toBeVisible();
    expect(
      screen.getByText('DEMO PRACTICE — NOT ACTUAL RBI PYQs'),
    ).toBeVisible();
    expect(useDemoSessionStore.getState().session?.visitedQuestionIds).toEqual([
      firstId,
    ]);
    expect(document.title).toBe(
      'Phase I demo | RBI Grade B Mock Exam Simulator',
    );
  });

  it('redirects a direct exam visit without a session back to instructions', () => {
    renderApp('/demo/exam');
    expect(
      screen.getByRole('heading', { name: 'Phase I demo instructions' }),
    ).toBeVisible();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Begin Demo' })).toBeDisabled();
  });

  it('Begin Demo resets a previous session, choices, flags, visits and active question', async () => {
    const user = userEvent.setup();
    const store = useDemoSessionStore.getState();
    store.beginDemo();
    store.dispatch({ type: 'select', optionId: 'b' });
    store.dispatch({ type: 'review-and-next' });
    store.dispatch({ type: 'select', optionId: 'c' });
    renderApp('/demo/instructions');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Begin Demo' }));
    const session = useDemoSessionStore.getState().session!;
    expect(session.activeQuestionId).toBe(firstId);
    expect(session.savedResponses).toEqual({});
    expect(session.reviewFlags).toEqual({});
    expect(session.visitedQuestionIds).toEqual([firstId]);
    expect(session.draft.selectedOptionId).toBeNull();
    expect(
      screen
        .getAllByRole('radio')
        .every((radio) => !(radio as HTMLInputElement).checked),
    ).toBe(true);
  });

  it('offers four working section tabs with independent visit state and keyboard navigation', async () => {
    const user = userEvent.setup();
    renderExam();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    for (const section of demoProfile.sections) {
      await user.click(screen.getByRole('tab', { name: section.title }));
      expect(screen.getByRole('tab', { name: section.title })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tabpanel')).toHaveAccessibleName(section.title);
      expect(
        screen.getByRole('heading', {
          name: demoQuestions.find((q) => q.id === section.questionIds[0])!
            .text,
        }),
      ).toBeVisible();
      expect(questionButton(1, 'Not Answered')).toHaveAttribute(
        'aria-current',
        'step',
      );
      expect(questionButton(2, 'Not Visited')).toBeVisible();
    }
    screen.getByRole('tab', { name: 'Reasoning Ability' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(
      screen.getByRole('tab', { name: 'General Awareness' }),
    ).toHaveFocus();
    expect(
      screen.getByRole('tab', { name: 'General Awareness' }),
    ).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    expect(
      screen.getByRole('tab', { name: 'Reasoning Ability' }),
    ).toHaveFocus();
    await user.keyboard('{Home}');
    expect(
      screen.getByRole('tab', { name: 'General Awareness' }),
    ).toHaveFocus();
  });

  it('supports keyboard answer selection, displays drafts and never saves through palette navigation', async () => {
    const user = userEvent.setup();
    renderExam();
    const radios = screen.getAllByRole('radio');
    await user.click(radios[0]!);
    await user.keyboard('{ArrowDown}');
    expect(radios[1]).toBeChecked();
    expect(useDemoSessionStore.getState().session?.draft.selectedOptionId).toBe(
      'b',
    );
    expect(screen.getByText(/Unsaved draft — save/)).toBeVisible();
    expect(questionButton(1, 'Not Answered')).toBeVisible();
    expect(
      screen.getByRole('list', { name: 'Active section status counts' }),
    ).toHaveTextContent(/Answered\s+0/);
    await user.click(questionButton(2, 'Not Visited'));
    await user.click(questionButton(1, 'Not Answered'));
    expect(
      screen
        .getAllByRole('radio')
        .every((radio) => !(radio as HTMLInputElement).checked),
    ).toBe(true);
    expect(useDemoSessionStore.getState().session?.savedResponses).toEqual({});
  });

  it('Save & Next commits and restores an answer while an unsaved replacement is discarded', async () => {
    const user = userEvent.setup();
    renderExam();
    await user.click(screen.getAllByRole('radio')[0]!);
    await user.click(screen.getByRole('button', { name: 'Save & Next' }));
    expect(questionButton(1, 'Answered')).toBeVisible();
    expect(questionButton(2, 'Not Answered')).toHaveAttribute(
      'aria-current',
      'step',
    );
    await user.click(screen.getByRole('button', { name: 'Previous Question' }));
    expect(screen.getAllByRole('radio')[0]).toBeChecked();
    await user.click(screen.getAllByRole('radio')[2]!);
    await user.click(screen.getByRole('button', { name: 'Next Question' }));
    await user.click(questionButton(1, 'Answered'));
    expect(screen.getAllByRole('radio')[0]).toBeChecked();
    expect(
      useDemoSessionStore.getState().session?.savedResponses[firstId]
        ?.selectedOptionId,
    ).toBe('a');
    await user.click(screen.getAllByRole('radio')[3]!);
    await user.click(screen.getByRole('tab', { name: 'English Language' }));
    await user.click(screen.getByRole('tab', { name: 'General Awareness' }));
    expect(screen.getAllByRole('radio')[0]).toBeChecked();
  });

  it('renders unanswered review, answered review and independently removable flags', async () => {
    const user = userEvent.setup();
    renderExam();
    await user.click(
      screen.getByRole('button', { name: 'Mark for Review & Next' }),
    );
    expect(questionButton(1, 'Marked for Review — Not Answered')).toBeVisible();
    await user.click(screen.getAllByRole('radio')[1]!);
    await user.click(
      screen.getByRole('button', { name: 'Mark for Review & Next' }),
    );
    expect(questionButton(2, 'Answered and Marked for Review')).toBeVisible();
    await user.click(questionButton(2, 'Answered and Marked for Review'));
    expect(screen.getAllByRole('radio')[1]).toBeChecked();
    await user.click(
      screen.getByRole('button', { name: 'Remove Review Flag' }),
    );
    expect(questionButton(2, 'Answered')).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getAllByRole('radio')[1]).toBeChecked();
    expect(
      screen.getByRole('button', { name: 'Remove Review Flag' }),
    ).toBeDisabled();
    expect(
      useDemoSessionStore.getState().session?.savedResponses[
        demoQuestions[1]!.id
      ]?.selectedOptionId,
    ).toBe('b');
  });

  it('Clear Response removes active answers while preserving its review flag and other questions', async () => {
    const user = userEvent.setup();
    renderExam();
    await user.click(screen.getAllByRole('radio')[0]!);
    await user.click(
      screen.getByRole('button', { name: 'Mark for Review & Next' }),
    );
    await user.click(screen.getAllByRole('radio')[1]!);
    await user.click(screen.getByRole('button', { name: 'Save & Next' }));
    await user.click(questionButton(1, 'Answered and Marked for Review'));
    await user.click(screen.getByRole('button', { name: 'Clear Response' }));
    expect(questionButton(1, 'Marked for Review — Not Answered')).toBeVisible();
    expect(questionButton(2, 'Answered')).toBeVisible();
    expect(
      screen
        .getAllByRole('radio')
        .every((radio) => !(radio as HTMLInputElement).checked),
    ).toBe(true);
    expect(
      useDemoSessionStore.getState().session?.savedResponses[firstId],
    ).toBeUndefined();
    await user.click(
      screen.getByRole('button', { name: 'Remove Review Flag' }),
    );
    expect(questionButton(1, 'Not Answered')).toBeVisible();
    await user.click(screen.getAllByRole('radio')[3]!);
    await user.click(screen.getByRole('button', { name: 'Clear Response' }));
    expect(
      useDemoSessionStore.getState().session?.draft.selectedOptionId,
    ).toBeNull();
  });

  it('handles first/last boundaries and never displays a timer, submission control, answer key or explanation', async () => {
    const user = userEvent.setup();
    renderExam();
    expect(
      screen.getByRole('button', { name: 'Previous Question' }),
    ).toBeDisabled();
    for (const section of demoProfile.sections) {
      await user.click(screen.getByRole('tab', { name: section.title }));
      for (let number = 1; number <= section.questionIds.length; number += 1) {
        await user.click(
          screen.getByRole('button', {
            name: new RegExp(`^Question ${number} —`),
          }),
        );
        const id = section.questionIds[number - 1]!;
        const original = runtimeDemoRecords.find(
          (question) => question.id === id,
        )!;
        expect(
          screen.getByRole('heading', { name: original.text }),
        ).toBeVisible();
        expect(
          screen.queryByText(original.explanation),
        ).not.toBeInTheDocument();
      }
    }
    expect(
      screen.getByRole('button', { name: 'Next Question' }),
    ).toBeDisabled();
    const lastId = demoQuestions.at(-1)!.id;
    await user.click(screen.getAllByRole('radio')[0]!);
    await user.click(screen.getByRole('button', { name: 'Save & Next' }));
    expect(useDemoSessionStore.getState().session?.activeQuestionId).toBe(
      lastId,
    );
    expect(questionButton(3, 'Answered')).toHaveAttribute(
      'aria-current',
      'step',
    );
    await user.click(
      screen.getByRole('button', { name: 'Mark for Review & Next' }),
    );
    expect(questionButton(3, 'Answered and Marked for Review')).toBeVisible();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /submit/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Correct answer:/)).not.toBeInTheDocument();
    expect(screen.getByText('Untimed · Unscored')).toBeVisible();
    expect(
      screen.getByText(/Last question. Save and review actions stay here/),
    ).toBeVisible();
  });

  it('discards an unsaved draft when leaving the candidate route, without removing a committed answer', async () => {
    const user = userEvent.setup();
    renderExam();
    await user.click(screen.getAllByRole('radio')[0]!);
    await user.click(screen.getByRole('button', { name: 'Save & Next' }));
    await user.click(questionButton(1, 'Answered'));
    await user.click(screen.getAllByRole('radio')[1]!);
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));
    expect(
      screen.getByRole('heading', { name: 'RBI Grade B Mock Exam Simulator' }),
    ).toBeVisible();
    expect(useDemoSessionStore.getState().session?.draft.selectedOptionId).toBe(
      'a',
    );
    expect(
      useDemoSessionStore.getState().session?.savedResponses[firstId]
        ?.selectedOptionId,
    ).toBe('a');
  });
});
