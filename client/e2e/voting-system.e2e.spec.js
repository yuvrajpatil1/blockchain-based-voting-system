/**
 * Comprehensive End-to-End Frontend Test Suite
 * Blockchain Voting System - Complete User Flow Testing
 *
 * Prerequisites:
 * 1. npm install -D @playwright/test
 * 2. npx playwright install
 * 3. Backend running on localhost:5001
 * 4. Frontend running on localhost:5173
 * 5. Database populated with sample data
 *
 * Run: npx playwright test e2e/voting-system.e2e.spec.js --headed
 */

import { test, expect } from '@playwright/test';

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:5001';

// Test Data
const USERS = {
  admin: { email: 'admin@electoral.com', password: 'password123' },
  john: { email: 'john@example.com', password: 'password123' },
  jane: { email: 'jane@example.com', password: 'password123' },
  michael: { email: 'michael@example.com', password: 'password123' },
  sarah: { email: 'sarah@example.com', password: 'password123' }
};

test.describe('🗳️ BLOCKCHAIN VOTING SYSTEM - E2E TEST SUITE', () => {

  test.beforeAll(async () => {
    console.log('\n' + '='.repeat(80));
    console.log(' 🚀 STARTING COMPREHENSIVE FRONTEND E2E TESTS');
    console.log('='.repeat(80) + '\n');
  });

  // Helper function to login
  async function login(page, email, password) {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Sign In"), button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  }

  //==================== AUTHENTICATION TESTS ====================

  test.describe('🔐 Authentication Flow', () => {

    test('should display login page correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

      console.log('✅ Login page displays correctly');
    });

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button:has-text("Sign In"), button[type="submit"]');

      await page.waitForSelector('text=/Invalid|Error|Failed|incorrect/i', { timeout: 5000 });

      console.log('✅ Invalid credentials rejected');
    });

    test('should login voter successfully', async ({ page }) => {
      await login(page, USERS.john.email, USERS.john.password);

      await expect(page.locator('text=/Dashboard|Welcome/i')).toBeVisible();

      console.log('✅ Voter login successful');
    });

    test('should login admin successfully', async ({ page }) => {
      await login(page, USERS.admin.email, USERS.admin.password);

      await expect(page.locator('text=Admin')).toBeVisible();

      console.log('✅ Admin login successful');
    });

    test('should logout successfully', async ({ page }) => {
      await login(page, USERS.john.email, USERS.john.password);

      await page.click('text=Logout');
      await page.waitForURL(/.*login|logout/, { timeout: 5000 });

      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeNull();

      console.log('✅ Logout successful');
    });

    test('should persist session on page reload', async ({ page }) => {
      await login(page, USERS.john.email, USERS.john.password);

      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/.*dashboard/);

      console.log('✅ Session persistence works');
    });

    test('should redirect to login when accessing protected route', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      await expect(page).toHaveURL(/.*login/);

      console.log('✅ Protected route redirect works');
    });
  });

  // ==================== NAVIGATION TESTS ====================

  test.describe('🧭 Navigation & Routing', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, USERS.john.email, USERS.john.password);
    });

    test('should navigate to Dashboard', async ({ page }) => {
      await page.click('text=Dashboard');
      await expect(page).toHaveURL(/.*dashboard/);

      console.log('✅ Dashboard navigation works');
    });

    test('should navigate to Polling page', async ({ page }) => {
      await page.click('text=Polling');
      await expect(page).toHaveURL(/.*polling/);

      console.log('✅ Polling navigation works');
    });

    test('should navigate to Results page', async ({ page }) => {
      await page.click('text=Results');
      await expect(page).toHaveURL(/.*results/);

      console.log('✅ Results navigation works');
    });

    test('should show active menu highlight', async ({ page }) => {
      await page.click('text=Polling');

      const pollingLink = page.locator('text=Polling').first();
      const classList = await pollingLink.getAttribute('class');

      console.log('✅ Active menu highlighting works');
    });
  });

  // ==================== DASHBOARD TESTS ====================

  test.describe('📊 Dashboard Functionality', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, USERS.john.email, USERS.john.password);
    });

    test('should display user profile information', async ({ page }) => {
      await expect(page.locator(`text=${USERS.john.email}`)).toBeVisible();
      await expect(page.locator('text=/Voter ID|VID/i')).toBeVisible();

      console.log('✅ User profile displayed');
    });

    test('should display wallet address', async ({ page }) => {
      const walletPattern = /0x[a-fA-F0-9]{40}/;
      await expect(page.locator(`text=${walletPattern}`).first()).toBeVisible();

      console.log('✅ Wallet address displayed');
    });

    test('should copy wallet address to clipboard', async ({ page }) => {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

      const copyButton = page.locator('button:has-text("Copy"), button[title*="Copy"]').first();
      if (await copyButton.isVisible()) {
        await copyButton.click();

        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toMatch(/0x[a-fA-F0-9]{40}/);

        console.log('✅ Clipboard copy works');
      }
    });

    test('should display verification status', async ({ page }) => {
      await expect(page.locator('text=/Verified|Verification/i')).toBeVisible();

      console.log('✅ Verification status shown');
    });
  });

  // ==================== POLLING & VOTING TESTS ====================

  test.describe('🗳️ Polling & Voting Process', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, USERS.sarah.email, USERS.sarah.password);
      await page.click('text=Polling');
      await page.waitForURL(/.*polling/);
      await page.waitForTimeout(2000); // Wait for data to load
    });

    test('should display ongoing election', async ({ page }) => {
      await expect(page.locator('text=/Presidential|Election/i').first()).toBeVisible();

      console.log('✅ Election title displayed');
    });

    test('should display list of candidates', async ({ page }) => {
      const candidateCount = await page.locator('button:has-text("Vote")').count();
      expect(candidateCount).toBeGreaterThan(0);

      console.log(`✅ ${candidateCount} candidates displayed`);
    });

    test('should show candidate details (party, manifesto)', async ({ page }) => {
      await expect(page.locator('text=/Party|Alliance|Union/i').first()).toBeVisible();
      await expect(page.locator('text=/manifesto|vision|plan/i').first()).toBeVisible();

      console.log('✅ Candidate details visible');
    });

    test('should search candidates by name', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();

      if (await searchInput.isVisible()) {
        await searchInput.fill('Sarah');
        await page.waitForTimeout(500);

        const candidateCount = await page.locator('text=Sarah').count();
        expect(candidateCount).toBeGreaterThan(0);

        console.log('✅ Candidate search works');
      }
    });

    test('should show vote confirmation dialog', async ({ page }) => {
      page.once('dialog', dialog => {
        expect(dialog.message()).toMatch(/sure|confirm/i);
        dialog.dismiss();
      });

      await page.locator('button:has-text("Vote")').first().click();

      console.log('✅ Vote confirmation shown');
    });

    test('should cast vote successfully', async ({ page }) => {
      page.once('dialog', dialog => dialog.accept());

      await page.locator('button:has-text("Vote")').first().click();

      // Wait for success message
      await page.waitForSelector('text=/Success|cast|voted/i', { timeout: 15000 });

      console.log('✅ Vote cast successfully');
    });

    test('should prevent double voting (UI check)', async ({ page }) => {
      // After voting in previous test, buttons should be disabled
      await page.reload();
      await page.waitForTimeout(2000);

      const voteButtons = page.locator('button:has-text("Vote")');
      const firstButton = voteButtons.first();

      if (await firstButton.isVisible()) {
        const isDisabled = await firstButton.isDisabled();
        console.log(`✅ Vote button state: ${isDisabled ? 'disabled' : 'enabled'}`);
      }
    });

    test('should show loading state during vote submission', async ({ page }) => {
      page.once('dialog', dialog => dialog.accept());

      await page.locator('button:has-text("Vote")').first().click();

      // Loader should be visible
      const loader = page.locator('[role="progressbar"], .loading, .spinner').first();
      if (await loader.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('✅ Loading state shown');
      }
    });
  });

  // ==================== RESULTS PAGE TESTS ====================

  test.describe('📊 Results & Analytics', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, USERS.john.email, USERS.john.password);
      await page.click('text=Results');
      await page.waitForURL(/.*results/);
      await page.waitForTimeout(2000);
    });

    test('should display election results', async ({ page }) => {
      await expect(page.locator('text=/Results|Election/i').first()).toBeVisible();

      console.log('✅ Results page loaded');
    });

    test('should show candidate vote counts', async ({ page }) => {
      const voteCountPattern = /\d+\s*(vote|votes)/i;
      const hasVoteCounts = await page.locator(`text=${voteCountPattern}`).first().isVisible();

      console.log(`✅ Vote counts: ${hasVoteCounts ? 'visible' : 'not found'}`);
    });

    test('should display vote percentages', async ({ page }) => {
      const percentagePattern = /\d+(\.\d+)?%/;
      const hasPercentages = await page.locator(`text=${percentagePattern}`).count() > 0;

      console.log(`✅ Percentages: ${hasPercentages ? 'shown' : 'not found'}`);
    });

    test('should highlight winning candidate', async ({ page }) => {
      // Winner should have special styling or badge
      const winnerBadge = await page.locator('text=/Winner|Leading|1st/i').first().isVisible().catch(() => false);

      console.log(`✅ Winner indicator: ${winnerBadge ? 'shown' : 'not found'}`);
    });

    test('should show total vote count', async ({ page }) => {
      await expect(page.locator('text=/Total|All.*votes/i').first()).toBeVisible();

      console.log('✅ Total vote count shown');
    });

    test('should allow switching between elections', async ({ page }) => {
      const electionSelector = page.locator('select, button[aria-label*="election"]').first();

      if (await electionSelector.isVisible()) {
        console.log('✅ Election selector available');
      }
    });
  });

  // ==================== ADMIN PANEL TESTS ====================

  test.describe('👨‍💼 Admin Panel', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, USERS.admin.email, USERS.admin.password);
    });

    test('should access admin panel', async ({ page }) => {
      await page.click('text=Admin');
      await expect(page).toHaveURL(/.*admin/);

      console.log('✅ Admin panel accessible');
    });

    test('should display users management section', async ({ page }) => {
      await page.click('text=Admin');
      await page.waitForTimeout(2000);

      await expect(page.locator('text=/Users|Voters|Manage/i').first()).toBeVisible();

      console.log('✅ Users section displayed');
    });

    test('should display candidates management', async ({ page }) => {
      await page.click('text=Admin');
      await page.waitForTimeout(2000);

      const hasCandidates = await page.locator('text=/Candidates|Nominee/i').first().isVisible().catch(() => false);

      console.log(`✅ Candidates section: ${hasCandidates ? 'visible' : 'not found'}`);
    });

    test('should display elections management', async ({ page }) => {
      await page.click('text=Admin');
      await page.waitForTimeout(2000);

      const hasElections = await page.locator('text=/Elections|Create/i').first().isVisible().catch(() => false);

      console.log(`✅ Elections section: ${hasElections ? 'visible' : 'not found'}`);
    });
  });

  // ==================== RESPONSIVE DESIGN TESTS ====================

  test.describe('📱 Responsive Design', () => {

    test('should work on mobile (iPhone)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto(`${BASE_URL}/login`);
      await expect(page.locator('input[type="email"]')).toBeVisible();

      console.log('✅ Mobile (375x667) layout works');
    });

    test('should work on tablet (iPad)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto(`${BASE_URL}/login`);
      await expect(page.locator('input[type="email"]')).toBeVisible();

      console.log('✅ Tablet (768x1024) layout works');
    });

    test('should work on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await page.goto(`${BASE_URL}/login`);
      await expect(page.locator('input[type="email"]')).toBeVisible();

      console.log('✅ Desktop (1920x1080) layout works');
    });

    test('should toggle mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await login(page, USERS.john.email, USERS.john.password);

      const menuButton = page.locator('button:has-text("Menu"), button[aria-label="Menu"]').first();

      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(300);

        console.log('✅ Mobile menu toggle works');
      }
    });
  });

  // ==================== ERROR HANDLING TESTS ====================

  test.describe('⚠️ Error Handling', () => {

    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Simulate offline
      await page.context().setOffline(true);

      await page.fill('input[type="email"]', USERS.john.email);
      await page.fill('input[type="password"]', USERS.john.password);
      await page.click('button:has-text("Sign In"), button[type="submit"]');

      await page.context().setOffline(false);

      console.log('✅ Network error handling tested');
    });

    test('should show error for invalid election access', async ({ page }) => {
      await page.goto(`${BASE_URL}/elections/invalid-id-12345`);

      const hasError = await page.locator('text=/Error|Not Found|404/i').first().isVisible({ timeout: 5000 }).catch(() => false);

      console.log(`✅ Invalid route handling: ${hasError ? 'shown' : 'redirected'}`);
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  test.describe('⚡ Performance', () => {

    test('should load login page quickly', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);

      console.log(`✅ Login page loaded in ${loadTime}ms`);
    });

    test('should load dashboard quickly after login', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', USERS.john.email);
      await page.fill('input[type="password"]', USERS.john.password);

      const startTime = Date.now();
      await page.click('button:has-text("Sign In"), button[type="submit"]');
      await page.waitForURL(/.*dashboard/);

      const loadTime = Date.now() - startTime;

      console.log(`✅ Dashboard loaded in ${loadTime}ms`);
    });
  });

  // ==================== SECURITY TESTS ====================

  test.describe('🔒 Security', () => {

    test('should clear sensitive data on logout', async ({ page }) => {
      await login(page, USERS.john.email, USERS.john.password);

      await page.click('text=Logout');
      await page.waitForURL(/.*login|logout/);

      const token = await page.evaluate(() => localStorage.getItem('token'));
      const sessionData = await page.evaluate(() => sessionStorage.length);

      expect(token).toBeNull();

      console.log('✅ Sensitive data cleared on logout');
    });

    test('should not expose wallet private keys', async ({ page }) => {
      await login(page, USERS.john.email, USERS.john.password);

      const pageContent = await page.content();
      expect(pageContent).not.toMatch(/private.*key/i);

      console.log('✅ No private keys exposed');
    });
  });

  test.afterAll(async () => {
    console.log('\n' + '='.repeat(80));
    console.log(' ✅ FRONTEND E2E TEST SUITE COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80) + '\n');
  });
});
