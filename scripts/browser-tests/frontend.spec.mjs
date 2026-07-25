import { test, expect } from '@playwright/test';
import { normalizeBasePath } from '../lib/site-paths.mjs';

const basePath = normalizeBasePath(process.env.BASE_PATH ?? '');
const siteUrl = (pathname) => `${basePath}${pathname}`;

async function visibleDecades(page) {
  return page.locator('[data-card]:visible').evaluateAll((cards) => [...new Set(cards.map((card) => {
    const year = Number.parseInt(card.dataset.publicationYear, 10);
    return Number.isFinite(year) ? `${Math.floor(year / 10) * 10}년대` : '연도 미상';
  }))]);
}

test('compact directories show one page and chronological labels match visible sources', async ({ page }) => {
  await page.goto(siteUrl('/sources/?sort=chronological'));
  const cards = page.locator('[data-card]');
  const visibleCards = page.locator('[data-card]:visible');
  const total = await cards.count();

  expect(total).toBeGreaterThan(30);
  await expect(visibleCards).toHaveCount(30);
  await expect(page.locator('[data-filter-count], .directory-result-count')).toHaveCount(0);
  await expect(page.locator('.directory-era-label span')).toHaveText(await visibleDecades(page));

  const more = page.locator('[data-filter-more]');
  while (await more.isVisible()) await more.click();

  await expect(visibleCards).toHaveCount(total);
  await expect(page.locator('.directory-era-label span')).toHaveText(await visibleDecades(page));
  expect(await page.evaluate(() => document.activeElement?.closest('[data-card]') !== null)).toBe(true);

  await page.goto(siteUrl('/concepts/'));
  await expect(page.locator('[data-card]:visible')).toHaveCount(30);
});

test('search uses one load-more control and preserves focus after the final batch', async ({ page }) => {
  await page.goto(siteUrl('/search/?q=Transformer'));
  const results = page.locator('[data-search-page-results] article');
  await expect(results.first()).toBeVisible();
  await expect(page.locator('[data-search-load-more]')).toHaveCount(1);

  const more = page.locator('[data-search-load-more]');
  while (await more.isVisible()) await more.click();

  expect(await page.evaluate(() => document.activeElement?.closest('[data-search-page-results]') !== null)).toBe(true);
});

test('autocomplete uses the compact index and relationship data waits for dialog use', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto(siteUrl('/'));
  const search = page.locator('[data-site-search] input:visible').first();
  await search.fill('Transformer');
  await expect(page.locator('[data-site-search]:visible [role="option"]').first()).toBeVisible();
  expect(requests.some((url) => url.endsWith('/search-suggestions.json'))).toBe(true);
  expect(requests.some((url) => url.endsWith('/search-index.json'))).toBe(false);

  await page.goto(siteUrl('/sources/'));
  const sourceHref = await page.locator('a[href*="/sources/006-"]').first().getAttribute('href');
  await page.goto(sourceHref);
  expect(requests.some((url) => url.endsWith('/relationship-data.json'))).toBe(false);

  await page.locator('[data-open-relationship-dialog]').first().click();
  await expect(page.locator('[data-relationship-dialog]')).toHaveAttribute('open', '');
  await expect.poll(() => requests.some((url) => url.endsWith('/relationship-data.json'))).toBe(true);
  await expect(page.locator('[data-relationship-explorer] .relationship-explorer__loading')).toHaveCount(0);
});

test('mobile navigation and directories do not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(siteUrl('/sources/'));
  await expect(page.locator('[data-card]:visible')).toHaveCount(30);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.goto(siteUrl('/'));
  const menu = page.locator('[data-menu-toggle]');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#primary-nav')).toBeVisible();
});

test('learning guide has a canonical route, navigation entry, and progressive enhancement hook', async ({ page }) => {
  await page.goto(siteUrl('/'));
  const guideCta = page.locator('[data-learning-guide-cta]');
  await expect(guideCta).toBeVisible();
  await expect(guideCta).toHaveAttribute('href', siteUrl('/guide/'));

  await guideCta.click();
  await expect(page.locator('[data-learning-guide-page]')).toBeVisible();
  await expect(page.locator('#primary-nav a[href="' + siteUrl('/guide/') + '"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-learning-diagnostic]')).toBeVisible();
  await expect(page.locator('script[src$="/assets/learning-guide.js"]')).toHaveCount(1);
});

test('learning guide stays within the mobile viewport', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(siteUrl('/guide/'));
  await expect(page.locator('[data-learning-guide-page]')).toBeVisible();
  await expect(page.locator('[data-learning-diagnostic]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(consoleErrors).toEqual([]);
});

test('learning guide diagnoses, persists only self-attested progress, and resets its own state', async ({ page }) => {
  await page.goto(siteUrl('/guide/'));
  const form = page.locator('[data-learning-diagnostic]');
  const answers = {
    'core-1': 'next-token-distribution',
    'core-2': 'separate-claim-conditions',
    'math-1': 'shape-preserves-axis-meaning',
    'math-2': 'gradient-update-direction',
    'history-1': 'locator',
    'history-2': 'comparison-conditions',
    'systems-1': 'runtime',
    'systems-2': 'failure-recovery',
  };

  await form.locator('input[name="learning-goal"][value="math"]').check();
  for (const [name, value] of Object.entries(answers)) {
    await form.locator(`input[name="${name}"][value="${value}"]`).check();
  }

  const c1 = page.locator('input[data-learning-module="C1"]');
  await expect(c1).not.toBeChecked();
  await form.locator('[data-learning-diagnostic-submit]').click();
  await expect(page.locator('[data-learning-diagnostic-result]')).toContainText('주 전공: 수학·모델 계산');
  await expect(page.locator('[data-learning-progress]')).toContainText('수학·모델 계산 경로 0/9 완료');

  await c1.check();
  await expect(page.locator('[data-learning-progress]')).toContainText('수학·모델 계산 경로 1/9 완료');
  await page.reload();
  await expect(page.locator('input[data-learning-module="C1"]')).toBeChecked();
  await expect(page.locator('[data-learning-progress]')).toContainText('수학·모델 계산 경로 1/9 완료');

  await page.locator('[data-learning-primary-track]').selectOption('systems');
  await expect(page.locator('[data-learning-progress]')).toContainText('시스템·평가 경로 1/9 완료');
  await page.reload();
  await expect(page.locator('[data-learning-primary-track]')).toHaveValue('systems');
  await expect(page.locator('input[data-learning-module="C1"]')).toBeChecked();

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('[data-learning-reset]').click();
  await expect(page.locator('input[data-learning-module="C1"]')).not.toBeChecked();
  await expect(page.locator('[data-learning-progress]')).toContainText('공통 코어 0/3 완료');
});

test('learning guide remains usable without JavaScript', async ({ browser }) => {
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(siteUrl('/guide/'));
  await expect(staticPage.locator('[data-learning-diagnostic]')).toBeVisible();
  await expect(staticPage.getByRole('heading', { name: /수동 채점표와 복귀 경로/ })).toBeVisible();
  await expect(staticPage.getByRole('heading', { name: /학습 기록 카드/ })).toBeVisible();
  await expect(staticPage.locator('input[data-learning-module="C1"]')).toBeVisible();
  await staticContext.close();
});

test('learning guide falls back cleanly when local storage is unavailable', async ({ browser }) => {
  const blockedContext = await browser.newContext();
  await blockedContext.addInitScript(() => {
    for (const method of ['getItem', 'setItem', 'removeItem']) {
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value() { throw new DOMException('blocked', 'SecurityError'); },
      });
    }
  });
  const blockedPage = await blockedContext.newPage();
  const consoleErrors = [];
  blockedPage.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await blockedPage.goto(siteUrl('/guide/'));
  await expect(blockedPage.locator('[data-learning-storage-status]')).toContainText('저장할 수 없습니다');
  await blockedPage.locator('input[data-learning-module="C1"]').check();
  await expect(blockedPage.locator('input[data-learning-module="C1"]')).toBeChecked();
  expect(consoleErrors).toEqual([]);
  await blockedContext.close();
});
