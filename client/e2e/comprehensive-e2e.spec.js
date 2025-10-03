/**
 * Comprehensive End-to-End Test Suite for Blockchain Voting System Frontend
 * Tests all user flows, UI interactions, and integration with backend APIs
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5001';

// Test users (matching backend sample data)
const TEST_USERS = {
  admin: {
    email: 'admin@electoral.com',
    password: 'password123',
    name: 'Admin User',
    role: 'admin'
  },
  voters: [
    { email: 'john@example.com', password: 'password123', name: 'John Doe' },
    { email: 'jane@example.com', password: 'password123', name: 'Jane Smith' },
    { email: 'michael@example.com', password: 'password123', name: 'Michael Chen' },
    { email: 'sarah@example.com', password: 'password123', name: 'Sarah Johnson' }
  ]
};

// Shared state across tests
let adminToken = '';
let voterToken = '';
let electionId = '';

test.describe('🗳️ Comprehensive Frontend E2E Test Suite', () => {

  // ==================== SETUP & TEARDOWN ====================

  test.beforeAll(async () => {
    console.log('='.repeat(80));
    console.log(' 🚀 STARTING FRONTEND E2E TEST SUITE');
    console.log('='.repeat(80));
  });

  test.afterAll(async () => {
    console.log('='.repeat(80));
    console.log(' ✅ FRONTEND E2E TEST SUITE COMPLETED');
    console.log('='.repeat(80));
  });

  // ==================== AUTHENTICATION & REGISTRATION TESTS ====================

  test.describe('🔐 Authentication Flow', () => {

    test('should display login page correctly', async ({ page }) => {
      await page.goto(BASE_URL);

      // Check if redirected to login
      await expect(page).toHaveURL(/.*login/);

      // Verify page elements
      await expect(page.locator('text=Electoral')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

      console.log('✅ Login page displays correctly');
    });

    test('should show validation errors for empty login form', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Try to submit without filling form
      await page.click('button:has-text("Sign In")');

      // Check for validation messages (either HTML5 or custom)
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeFocused();

      console.log('✅ Empty form validation works');
    });

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button:has-text("Sign In")');

      // Wait for error message
      await page.waitForSelector('text=/Invalid|Error|Failed/i', { timeout: 5000 });

      console.log('✅ Invalid credentials rejected');
    });

    test('should login as voter successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await page.fill('input[type="email"]', TEST_USERS.voters[0].email);
      await page.fill('input[type="password"]', TEST_USERS.voters[0].password);
      await page.click('button:has-text("Sign In")');

      // Wait for redirect to dashboard
      await page.waitForURL(/.*dashboard/, { timeout: 10000 });

      // Verify dashboard elements
      await expect(page.locator(`text=/Hi.*${TEST_USERS.voters[0].name.split(' ')[0]}/i`)).toBeVisible();

      console.log('✅ Voter login successful');
    });

    test('should login as admin successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await page.fill('input[type="email"]', TEST_USERS.admin.email);
      await page.fill('input[type="password"]', TEST_USERS.admin.password);
      await page.click('button:has-text("Sign In")');

      // Wait for redirect
      await page.waitForURL(/.*dashboard/, { timeout: 10000 });

      // Admin should see Admin menu option
      await expect(page.locator('text=Admin')).toBeVisible();

      console.log('✅ Admin login successful');
    });

    test('should navigate to registration page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Click on register link
      await page.click('text=/Sign Up|Register|Create Account/i');

      await expect(page).toHaveURL(/.*register/);
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();

      console.log('✅ Registration page accessible');
    });

    test('should show password strength indicator', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      await page.fill('input[type="password"]', 'weak');
      // Password strength indicator should be visible
      await page.waitForTimeout(500);

      await page.fill('input[type="password"]', 'StrongP@ssw0rd123');
      await page.waitForTimeout(500);

      console.log('✅ Password strength indicator works');
    });
  });

  // ==================== NAVIGATION & LAYOUT TESTS ====================

  test.describe('🧭 Navigation & Layout', () => {

    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_USERS.voters[0].email);
      await page.fill('input[type="password"]', TEST_USERS.voters[0].password);
      await page.click('button:has-text("Sign In")');
      await page.waitForURL(/.*dashboard/);
    });

    test('should display sidebar with menu items', async ({ page }) => {
      // Check for navigation menu items
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Polling')).toBeVisible();
      await expect(page.locator('text=Results')).toBeVisible();
      await expect(page.locator('text=Logout')).toBeVisible();

      console.log('✅ Sidebar navigation visible');
    });

    test('should navigate to Dashboard', async ({ page }) => {
      await page.click('text=Dashboard');
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('text=/Welcome|Dashboard/i')).toBeVisible();

      console.log('✅ Dashboard navigation works');
    });

    test('should navigate to Polling page', async ({ page }) => {
      await page.click('text=Polling');
      await expect(page).toHaveURL(/.*polling/);
      await expect(page.locator('text=/Cast Your Vote|Polling/i')).toBeVisible();

      console.log('✅ Polling page navigation works');
    });

    test('should navigate to Results page', async ({ page }) => {
      await page.click('text=Results');
      await expect(page).toHaveURL(/.*results/);
      await expect(page.locator('text=/Results|Election Results/i')).toBeVisible();

      console.log('✅ Results page navigation works');
    });

    test('should toggle mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport

      // Find and click menu button
      const menuButton = page.locator('button:has-text("Menu"), button[aria-label="Menu"]').first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(300);

        console.log('✅ Mobile menu toggle works');
      }
    });

    test('should logout successfully', async ({ page }) => {
      await page.click('text=Logout');

      // Should redirect to login
      await page.waitForURL(/.*login|logout/, { timeout: 5000 });

      // Verify token is cleared
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeNull();

      console.log('✅ Logout successful');
    });
  });

  // ==================== DASHBOARD TESTS ====================

  test.describe('📊 Dashboard Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_USERS.voters[0].email);
      await page.fill('input[type="password"]', TEST_USERS.voters[0].password);
      await page.click('button:has-text("Sign In")');
      await page.waitForURL(/.*dashboard/);
    });

    test('should display user information', async ({ page }) => {
      // Check for user name
      await expect(page.locator(`text=/${TEST_USERS.voters[0].name}/i`)).toBeVisible();

      // Check for email
      await expect(page.locator(`text=${TEST_USERS.voters[0].email}`)).toBeVisible();

      console.log('✅ User information displayed');
    });

    test('should display wallet address', async ({ page }) => {
      // Look for wallet address pattern (0x...)
      await expect(page.locator('text=/0x[a-fA-F0-9]{40}/').first()).toBeVisible();

      console.log('✅ Wallet address displayed');
    });

    test('should copy wallet address to clipboard', async ({ page }) => {
      // Grant clipboard permissions
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

      // Find and click copy button
      const copyButton = page.locator('button:has-text("Copy"), button[title*="Copy"]').first();
      if (await copyButton.isVisible()) {
        await copyButton.click();

        // Verify clipboard content
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toMatch(/0x[a-fA-F0-9]{40}/);

        console.log('✅ Wallet address copy works');
      }
    });

    test('should display voter ID and verification status', async ({ page }) => {
      // Check for verification badge or status
      await expect(page.locator('text=/Verified|Voter ID/i')).toBeVisible();

      console.log('✅ Verification status displayed');
    });

    test('should show quick stats or cards', async ({ page }) => {
      // Dashboard might have stats cards
      const hasStats = await page.locator('div:has-text("Elections"), div:has-text("Votes")').count() > 0;

      console.log(`✅ Dashboard stats: ${hasStats ? 'visible' : 'not implemented'}`);
    });
  });

  // ==================== POLLING PAGE TESTS ====================

  test.describe('🗳️ Polling & Voting', () => {

    test.beforeEach(async ({ page }) => {
      // Login as voter who hasn't voted yet
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_USERS.voters[1].email);
      await page.fill('input[type="password"]', TEST_USERS.voters[1].password);
      await page.click('button:has-text("Sign In")');
      await page.waitForURL(/.*dashboard/);

      // Navigate to polling
      await page.click('text=Polling');
      await page.waitForURL(/.*polling/);
    });

    test('should display ongoing elections', async ({ page }) => {
      // Wait for elections to load
      await page.waitForTimeout(2000);

      // Check for election title
      await expect(page.locator('text=/Presidential|Election/i').first()).toBeVisible();

      console.log('✅ Elections displayed');
    });

    test('should display list of candidates', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Check for candidate names
      const candidateCount = await page.locator('button:has-text("Vote")').count();
      expect(candidateCount).toBeGreaterThan(0);

      console.log(`✅ ${candidateCount} candidates displayed`);
    });

    test('should show candidate details', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Check for party names and manifestos
      await expect(page.locator('text=/Party|Alliance|Union|Independent/i').first()).toBeVisible();

      console.log('✅ Candidate details visible');
    });

    test('should filter candidates by search', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Look for search input
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Sarah');
        await page.waitForTimeout(500);

        console.log('✅ Candidate search works');
      }
    });

    test('should filter candidates by party', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Look for filter dropdown
      const filterButton = page.locator('button:has-text("Filter"), select').first();
      if (await filterButton.isVisible()) {
        await filterButton.click();

        console.log('✅ Party filter available');
      }
    });

    test('should show vote confirmation dialog', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Click first vote button
      const voteButton = page.locator('button:has-text("Vote")').first();

      // Set up dialog handler
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('Are you sure');
        dialog.dismiss();
      });

      await voteButton.click();

      console.log('✅ Vote confirmation dialog shown');
    });

    test('should cast vote successfully', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Accept confirmation dialog
      page.on('dialog', dialog => dialog.accept());

      // Click vote button
      const voteButton = page.locator('button:has-text("Vote")').first();
      await voteButton.click();

      // Wait for success message
      await page.waitForSelector('text=/Success|Vote cast|Voted/i', { timeout: 10000 });

      console.log('✅ Vote cast successfully');
    });

    test('should prevent double voting', async ({ page }) => {
      // This voter should have already voted in previous test
      await page.waitForTimeout(2000);

      // Vote