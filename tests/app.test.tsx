import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../src/app/App';

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('Phase 0 application', () => {
  it('renders the dashboard, independent identity, official-pattern caveat and honest count', () => {
    renderApp();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'RBI Grade B Mock Exam Simulator',
      }),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Independent computer-based examination practice application',
      ),
    ).toBeVisible();
    expect(screen.getByText(/Not official RBI or IBPS software/)).toBeVisible();
    expect(
      screen.getByText(
        'RBI Grade B 2027 examination pattern awaiting official notification.',
      ),
    ).toBeVisible();
    expect(screen.getByText('No verified PYQs imported yet.')).toBeVisible();
    expect(
      screen.getByText('verified PYQs').previousElementSibling,
    ).toHaveTextContent('0');
  });

  it('marks every future exam option as unavailable using native disabled buttons', async () => {
    const user = userEvent.setup();
    renderApp();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    for (const name of [
      'RBI Grade B — Phase I',
      'RBI Grade B — Phase II',
      'Sectional Practice',
    ]) {
      const card = screen.getByRole('heading', { name }).closest('article');
      expect(card).not.toBeNull();
      const button = within(card!).getByRole('button', {
        name: /not implemented/,
      });
      expect(button).toBeDisabled();
      expect(within(card!).getByText('Not implemented')).toBeVisible();
      await user.click(button);
    }
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'RBI Grade B Mock Exam Simulator',
    );
  });

  it('navigates to the question bank and back using the application links', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('link', { name: /View question bank/ }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Question bank' }),
    ).toBeVisible();
    expect(screen.getByText('0 verified PYQs')).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'No verified PYQs imported yet.' }),
    ).toBeVisible();
    expect(
      screen.getByText(/Synthetic developer fixtures are kept separate/),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Question bank' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(document.title).toBe(
      'Question bank | RBI Grade B Mock Exam Simulator',
    );
    expect(screen.getByRole('main')).toHaveFocus();
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'RBI Grade B Mock Exam Simulator',
    );
  });

  it('supports the direct catalog route and keyboard navigation', async () => {
    const user = userEvent.setup();
    renderApp('/question-bank');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Question bank' }),
    ).toBeVisible();
    screen.getByRole('link', { name: 'Dashboard' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'RBI Grade B Mock Exam Simulator',
    );
  });

  it('offers recovery for unknown routes', async () => {
    const user = userEvent.setup();
    renderApp('/missing');
    expect(
      screen.getByRole('heading', { name: 'This page is unavailable.' }),
    ).toBeVisible();
    await user.click(screen.getByRole('link', { name: /Return to dashboard/ }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'RBI Grade B Mock Exam Simulator',
    );
  });
});
