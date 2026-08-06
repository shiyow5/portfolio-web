import { expect, test } from '@playwright/test';
import { FAQ } from '../src/lib/seo/renderStatic';

test.describe('Smoke', () => {
  test('editorial home renders hero + work + chat FAB', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /shiyow/i })).toBeVisible();
    await expect(page.getByText(/open to work/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /selected work/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /open chat/i })).toBeVisible();
  });

  test('toggles between editorial and terminal modes', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: /terminal/i })
      .first()
      .click();
    await expect(page.getByText(/shiyow@devstation/i)).toBeVisible();

    await page
      .getByRole('button', { name: /editorial/i })
      .first()
      .click();
    await expect(page.getByRole('heading', { level: 1, name: /shiyow/i })).toBeVisible();
  });

  // Google indexes the post-JS DOM. The FAQPage JSON-LD and the prerendered
  // body are only credible if the mounted app shows the same answers, so assert
  // it in a real browser rather than trusting the static render alone.
  test('rendered page shows the name reading and every FAQ answer', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('しよを').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'FAQ', exact: true })).toBeVisible();
    for (const entry of FAQ) {
      await expect(page.getByText(entry.q, { exact: true })).toBeVisible();
    }
  });

  test('chat widget opens from the FAB', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open chat/i }).click();
    await expect(page.getByText(/shiyow clone/i)).toBeVisible();
  });
});
