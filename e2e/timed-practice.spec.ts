import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function begin(page: Page) {
  // Browser clock control, not a production timing shortcut or test-only app profile.
  await page.clock.install({ time: new Date('2026-11-07T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-07T12:00:01Z'));
  await page.goto('/');
  await page.getByRole('link', { name: 'Try Timed Practice' }).click();
  await expect(
    page.getByRole('button', { name: 'Begin Timed Mock' }),
  ).toBeDisabled();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Begin Timed Mock' }).click();
  await expect(page.getByRole('timer')).toContainText('01:00');
}

test('save, refresh, discard draft, cancel/confirm submission and refresh result', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await begin(page);
  await expect(page.getByText(/Correct answer:/)).toHaveCount(0);
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Mark for Review & Next' }).click();
  await page.clock.fastForward(20000);
  await page.reload();
  await expect(page.getByRole('timer')).toContainText('00:40');
  await page
    .getByRole('button', {
      name: 'Question 1 — Answered and Marked for Review',
      exact: true,
    })
    .click();
  await expect(page.getByRole('radio').first()).toBeChecked();
  await page.getByRole('radio').nth(1).check();
  await page
    .getByRole('button', { name: 'Question 2 — Not Answered', exact: true })
    .click();
  await page
    .getByRole('button', {
      name: 'Question 1 — Answered and Marked for Review',
      exact: true,
    })
    .click();
  await expect(page.getByRole('radio').first()).toBeChecked();
  await expect(
    page.getByRole('button', { name: 'English Language — Locked / upcoming' }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('timed-exam.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Submit Exam' }).click();
  await expect(page.getByRole('dialog')).toContainText(
    'Saved answers: 1; unanswered: 11',
  );
  await expect(
    page.getByRole('button', { name: 'Cancel / Continue Exam' }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Submit Exam' }).click();
  await page.getByRole('button', { name: 'Confirm Submission' }).click();
  await expect(
    page.getByRole('heading', { name: 'Score: 1 / 12' }),
  ).toBeVisible();
  await expect(
    page.getByText('Correct answer: A budget', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Explanation:/)).toHaveCount(12);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Score: 1 / 12' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('timed-results.png'),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test('delayed clock ticks skip expired sections and final expiry submits at the original deadline', async ({
  page,
}) => {
  await begin(page);
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Save & Next' }).click();
  await page.clock.fastForward(125000);
  await expect(
    page.getByRole('button', { name: 'Quantitative Aptitude — Active' }),
  ).toBeEnabled();
  await expect(
    page.getByRole('button', { name: 'General Awareness — Expired / locked' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'English Language — Expired / locked' }),
  ).toBeDisabled();
  await expect(page.getByRole('timer')).toContainText('00:55');
  await page.reload();
  await expect(page.getByRole('timer')).toContainText('00:55');
  await page.getByRole('radio').first().check(); // draft must lose to final timeout.
  await page.getByRole('button', { name: 'Submit Exam' }).click();
  await page.clock.fastForward(120000);
  await expect(
    page.getByRole('heading', { name: 'Timed practice results' }),
  ).toBeVisible();
  await expect(page.getByText(/Submission: Time expiry/)).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Score: 1 / 12' }),
  ).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Score: 1 / 12' }),
  ).toBeVisible();
});

test('reopening after the entire schedule expired auto-submits without granting fresh time', async ({
  page,
}) => {
  await begin(page);
  await page.goto('/'); // no mounted timed interval while away.
  await page.clock.fastForward(300000);
  await page.goto('/demo/timed/exam');
  await expect(
    page.getByRole('heading', { name: 'Timed practice results' }),
  ).toBeVisible();
  await expect(page.getByText(/Submission: Time expiry/)).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Score: 0 / 12' }),
  ).toBeVisible();
});

test('original untimed demo remains available and does not start the timed clock', async ({
  page,
}) => {
  await page.goto('/demo/instructions');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Begin Demo', exact: true }).click();
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Save & Next' }).click();
  await expect(
    page.getByRole('button', { name: 'Question 1 — Answered', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('timer')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Submit Exam' })).toHaveCount(
    0,
  );
});
