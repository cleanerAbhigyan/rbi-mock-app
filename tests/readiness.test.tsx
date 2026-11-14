import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { App } from '../src/app/App';

it('shows truthful read-only source/profile readiness and local operator boundaries', () => {
  render(
    <MemoryRouter initialEntries={['/question-bank']}>
      <App />
    </MemoryRouter>,
  );
  const readiness = screen.getByRole('region', {
    name: 'Source and profile readiness',
  });
  for (const label of [
    'Public source manifests',
    'Approved human question reviews',
    'Verified official reference profiles',
  ]) {
    expect(
      within(readiness).getByText(label).nextElementSibling,
    ).toHaveTextContent('0');
  }
  expect(
    within(readiness).getByText(/2027 profile: awaiting official notification/),
  ).toBeVisible();
  expect(
    within(readiness).getByText(
      /Imported approval flags cannot grant approval/,
    ),
  ).toBeVisible();
  expect(within(readiness).queryByRole('button')).not.toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'No verified PYQs imported yet.' }),
  ).toBeVisible();
  expect(
    within(readiness).getByText(/Private staged extracts are not loaded/),
  ).toBeVisible();
});
