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
