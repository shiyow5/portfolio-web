import { expect, test } from '@playwright/test';

test.describe('Smoke', () => {
  test('home renders hero + Recent Loot + chat widget FAB', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /level 1: home/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /recent loot/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /open chat/i })).toBeVisible();
  });

  test('gallery filters to a category', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.getByRole('heading', { name: /archive of completed tasks/i })).toBeVisible();
    const filter = page.getByRole('button', { name: /^ui \/ ux/i });
    await filter.click();
    await expect(filter).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('link', { name: /neon circuit/i })).toBeVisible();
  });

  test('work detail page renders from id', async ({ page }) => {
    await page.goto('/works/aether-drift');
    await expect(page.getByRole('heading', { level: 1, name: /aether drift/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /quest log/i })).toBeVisible();
  });

  test('about shows character sheet', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/status/i);
    await expect(page.getByRole('heading', { name: /ability board/i })).toBeVisible();
  });

  test('changelog shows patch notes timeline', async ({ page }) => {
    await page.goto('/changelog');
    await expect(page.getByRole('heading', { name: /development/i })).toBeVisible();
    await expect(page.getByText(/patch notes/i)).toBeVisible();
  });

  test('unknown route shows 404', async ({ page }) => {
    await page.goto('/no-such-page');
    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible();
  });

  test('hamburger menu opens, navigates, and closes', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('button[aria-controls="site-menu-panel"]');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const panel = page.getByRole('dialog', { name: /site navigation/i });
    await expect(panel).toBeVisible();

    const aboutLink = panel.getByRole('link', { name: /about/i });
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('dialog', { name: /site navigation/i })).toBeHidden();
  });
});
