import { expect, test } from '@playwright/test';

test('question-bank readiness is honest, read-only and responsive', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Question bank', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'No verified PYQs imported yet.' }),
  ).toBeVisible();
  const readiness = page.getByRole('region', {
    name: 'Source and profile readiness',
  });
  await expect(readiness).toContainText(/Public source manifests\s*0/);
  await expect(readiness).toContainText(/Approved human question reviews\s*0/);
  await expect(readiness).toContainText(
    /Verified official reference profiles\s*0/,
  );
  await expect(readiness).toContainText(
    '2027 profile: awaiting official notification.',
  );
  await expect(readiness.getByRole('button')).toHaveCount(0);
  await expect(readiness).toContainText(
    'Imported approval flags cannot grant approval.',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('source-readiness.png'),
    fullPage: true,
  });
});
