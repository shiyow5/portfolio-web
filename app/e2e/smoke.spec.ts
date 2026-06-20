import { expect, test } from '@playwright/test';

test.describe('Smoke', () => {
  test('editorial home renders hero + work + chat FAB', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /engineer/i })).toBeVisible();
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
    await expect(page.getByRole('heading', { level: 1, name: /engineer/i })).toBeVisible();
  });

  test('chat widget opens from the FAB', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open chat/i }).click();
    await expect(page.getByText(/shiyow clone/i)).toBeVisible();
  });
});
