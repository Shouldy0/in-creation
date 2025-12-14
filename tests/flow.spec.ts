
import { test, expect } from '@playwright/test';

test('complete user journey', async ({ page }) => {
    // 1. Sign Up
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Create Account")');
    // Mock email confirmation or assume dev mode allows generic login? 
    // In dev / supabase local, email confirmation might be off or we need to insert user directly.
    // We'll assume the user uses the 'Sign In' flow for this test if manually created, 
    // or checks for the success message.
    await expect(page.locator('text=Check your email')).toBeVisible();

    // 2. Profile Creation (Assuming logged in - usually requires helper in tests)
    // This test script is exemplary as we can't easily bypass auth captchas/email without setup.
});

test('authenticated flow', async ({ page }) => {
    // Assumption: User is logged in via storage state or setup
    await page.goto('http://localhost:3000/profile');

    // Create Profile
    await page.fill('input[placeholder="e.g. Jane Doe"]', 'Test Artist');
    await page.fill('textarea', 'A test bio.');
    await page.click('button:has-text("Save Profile")');
    await expect(page.locator('h1:has-text("Test Artist")')).toBeVisible();

    // Create Post
    await page.click('text=Document Process');
    await page.fill('input[placeholder*="Sketching"]', 'My New Work');
    await page.fill('textarea', 'Feeling flowy.');
    await page.click('button:has-text("Publish Post")');

    // Check Feed
    await page.goto('http://localhost:3000/feed');
    await expect(page.locator('text=My New Work')).toBeVisible();
});
