import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should successfully register, log in, and redirect to dashboard', async ({ page }) => {
        const testEmail = `playwright_${Date.now()}@example.com`;
        const testPassword = 'Password123!';

        // 1. Navigate to Register
        await page.goto('http://localhost:3000/register');

        // Fill Registration Form
        await page.locator('input[name="email"]').fill(testEmail);
        await page.locator('input[name="password"]').fill(testPassword);
        await page.locator('input[name="confirmPassword"]').fill(testPassword);

        // Submit Registration
        await page.getByRole('button', { name: /register/i }).click();

        // 2. Verify successful auto-login and redirect to the Dashboard
        await page.waitForURL('http://localhost:3000/');

        // Verify an authenticated UI element appears (e.g., Logout button)
        const logoutText = page.getByText(/log out/i);
        await expect(logoutText).toBeVisible({ timeout: 10000 });
    });
});
