import { test, expect } from '@playwright/test';
import { registerViaUI, loginViaUI, logoutViaUI, uniqueSuffix } from './helpers';

test.describe('auth', () => {
  for (const role of ['buyer', 'supplier', 'logistics'] as const) {
    test(`register as ${role} lands on the dashboard`, async ({ page }) => {
      const suffix = uniqueSuffix();
      await registerViaUI(page, {
        name: `E2E ${role} ${suffix}`,
        email: `${role}-${suffix}@e2e.agriflow`,
        password: 'testpass123',
        role,
      });
      await expect(page).toHaveURL(/\/app\/dashboard$/);
    });
  }

  test('logout then log back in, and a refresh keeps the session', async ({ page }) => {
    const suffix = uniqueSuffix();
    const email = `buyer-${suffix}@e2e.agriflow`;
    const password = 'testpass123';

    await registerViaUI(page, { name: `E2E Buyer ${suffix}`, email, password, role: 'buyer' });
    await expect(page).toHaveURL(/\/app\/dashboard$/);

    await logoutViaUI(page);
    await expect(page).toHaveURL(/\/login$/);
    // Logged out: a protected route should bounce back to /login.
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/\/login$/);

    await loginViaUI(page, email, password);
    await expect(page).toHaveURL(/\/app\/dashboard$/);

    // Refresh keeps the session — session/token persist in localStorage.
    await page.reload();
    await expect(page).toHaveURL(/\/app\/dashboard$/);
    await page.locator('header button[type="button"]').first().click();
    await expect(page.getByText(email)).toBeVisible();
  });

  test('wrong password is rejected with the backend error message', async ({ page }) => {
    const suffix = uniqueSuffix();
    const email = `buyer-${suffix}@e2e.agriflow`;
    await registerViaUI(page, { name: `E2E Buyer ${suffix}`, email, password: 'testpass123', role: 'buyer' });
    await logoutViaUI(page);

    await page.goto('/login');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill('the-wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid email or password', { exact: false })).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
