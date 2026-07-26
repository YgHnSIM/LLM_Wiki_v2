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
  await expect(page.locator('[data-filter-status]')).toContainText(`전체 ${total}개 중 ${total}개 일치`);
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

test('autocomplete uses the compact index, keeps one keyboard cursor, and relationship data waits for dialog use', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto(siteUrl('/'));
  const search = page.locator('[data-site-search] input:visible').first();
  await expect(search).toHaveAttribute('placeholder', '제목·별칭·태그 빠른 검색');
  await search.fill('Transformer');
  const options = page.locator('[data-site-search]:visible [role="option"]');
  await expect(options.first()).toBeVisible();
  await expect(options.first()).toHaveAttribute('tabindex', '-1');
  await search.press('ArrowDown');
  await expect(search).toHaveAttribute('aria-activedescendant', await options.first().getAttribute('id'));
  await search.press('Escape');
  await expect(search.locator('xpath=ancestor::form').locator('[data-search-results]')).toBeHidden();
  expect(requests.some((url) => url.endsWith('/search-suggestions.json'))).toBe(true);
  expect(requests.some((url) => url.endsWith('/search-index.json'))).toBe(false);

  await page.goto(siteUrl('/sources/'));
  const sourceHref = await page.locator('a[href*="/sources/006/"]').first().getAttribute('href');
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
  const dialog = page.locator('[data-mobile-nav-dialog]');
  await expect(dialog).toHaveAttribute('open', '');
  await expect(page.locator('#primary-nav')).toBeVisible();
  const menuGeometry = await page.evaluate(() => {
    const menuButtonBox = document.querySelector('[data-menu-toggle]').getBoundingClientRect();
    const headerBox = document.querySelector('.site-header').getBoundingClientRect();
    const dialogBox = document.querySelector('[data-mobile-nav-dialog]').getBoundingClientRect();
    const navBox = document.querySelector('.mobile-nav-dialog__nav').getBoundingClientRect();
    const firstLink = document.querySelector('.mobile-nav-dialog__nav > a');
    const firstLinkBox = firstLink.getBoundingClientRect();
    return {
      dialogWidth: dialogBox.width,
      leftGutter: dialogBox.left,
      rightGutter: window.innerWidth - dialogBox.right,
      topGap: dialogBox.top - Math.max(menuButtonBox.bottom, headerBox.bottom),
      firstLinkJustifyContent: getComputedStyle(firstLink).justifyContent,
      firstLinkWidthShare: firstLinkBox.width / navBox.width,
    };
  });
  expect(menuGeometry.dialogWidth).toBeLessThanOrEqual(288);
  expect(menuGeometry.leftGutter).toBeGreaterThan(menuGeometry.rightGutter);
  expect(menuGeometry.leftGutter - menuGeometry.rightGutter).toBeGreaterThanOrEqual(30);
  expect(menuGeometry.topGap).toBeGreaterThanOrEqual(6);
  expect(menuGeometry.topGap).toBeLessThanOrEqual(10);
  expect(menuGeometry.firstLinkJustifyContent).toBe('center');
  expect(menuGeometry.firstLinkWidthShare).toBeGreaterThan(0.85);
  expect(await page.evaluate(() => document.activeElement?.closest('[data-mobile-nav-dialog]') !== null)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(menu).toBeFocused();
});

test('mobile navigation remains reachable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(siteUrl('/'));

  await expect(page.locator('.primary-nav--noscript')).toBeVisible();
  await expect(page.locator('.primary-nav--noscript a[href="' + siteUrl('/search/') + '"]')).toBeVisible();
  await expect(page.locator('[data-menu-toggle]')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await context.close();
});

test('mobile navigation falls back when native dialog support is unavailable', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.addInitScript(() => Object.defineProperty(window, 'HTMLDialogElement', {
    value: undefined,
    configurable: true,
  }));
  await page.goto(siteUrl('/'));

  const menu = page.locator('[data-menu-toggle]');
  const dialog = page.locator('[data-mobile-nav-dialog]');
  await menu.click();
  await expect(dialog).toHaveAttribute('open', '');
  await expect(dialog).toHaveClass(/is-fallback-open/);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(menu).toBeFocused();

  await context.close();
});

test('mobile query-only search keeps detailed filters collapsed and exposes a result', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(siteUrl('/search/?q=Transformer'));
  const panel = page.locator('[data-search-filter-panel]');
  await expect(panel).not.toHaveAttribute('open', '');
  await expect(page.locator('[data-search-page-results] article').first()).toBeVisible();
  await expect(page.locator('[data-search-page-live-status]')).toContainText(/검색 결과/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('directory filtering reports matches, can reset, and shows the active sort metric', async ({ page }) => {
  await page.goto(siteUrl('/concepts/'));
  const input = page.locator('[data-filter-input]');
  await input.fill('Transformer');
  await expect(page.locator('[data-filter-status]')).toContainText(/전체 \d+개 중 \d+개 일치/);
  const reset = page.locator('[data-filter-reset]');
  await expect(reset).toBeVisible();
  await page.locator('[data-filter-sort]').selectOption('connections');
  await expect(page.locator('[data-card]:visible [data-sort-metric]').first()).toContainText('연결');
  await reset.click();
  await expect(input).toHaveValue('');
});

test('desktop directories use two catalogue columns', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of ['/sources/', '/concepts/', '/entities/', '/analyses/']) {
    await page.goto(siteUrl(route));
    const grid = page.locator('[data-filter-grid]');
    expect(await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length)).toBe(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }

  await page.goto(siteUrl('/sources/?view=cards'));
  const sourceCards = page.locator('[data-filter-grid]');
  expect(await sourceCards.evaluate((element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length)).toBe(2);
  expect(await sourceCards.locator('.source-card').first().evaluate((element) => getComputedStyle(element).gridTemplateColumns)).toContain('86px');

  await page.goto(siteUrl('/concepts/?view=cards'));
  const conceptCards = page.locator('[data-filter-grid]');
  expect(await conceptCards.evaluate((element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length)).toBe(2);
});

test('long mobile article titles and evidence facts wrap without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(siteUrl('/sources/110-저자원-언어-llm의-성능-격차와-전이-평가-경계/'));
  const title = page.locator('.article-title-block h1');
  await expect(title).toBeVisible();
  expect(await title.evaluate((element) => {
    const style = getComputedStyle(element);
    return Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize) >= 1.04;
  })).toBe(true);
  const fact = page.locator('.article-facts__evidence');
  await expect(fact).toBeVisible();
  expect(await fact.locator('dd').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('document titles replace subtitle dashes with colons across static and dynamic views', async ({ page }) => {
  await page.goto(siteUrl('/analyses/같은-벡터-공간은-무엇을-보장하는가-공기-대조-생성의-경계/'));
  const title = page.locator('.article-title-block h1');
  await expect(title).toHaveText('같은 벡터 공간은 무엇을 보장하는가: 공기·대조·생성의 경계');
  await expect(title.locator('br')).toHaveCount(0);
  await expect(page.locator('.breadcrumbs .breadcrumb-current')).toContainText('같은 벡터 공간은 무엇을 보장하는가: 공기·대조·생성의 경계');
  await expect(page.locator('.breadcrumbs .breadcrumb-current br')).toHaveCount(0);
  await expect(page.locator('.article-body h2').first().locator('br')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.locator('[data-open-relationship-dialog]').first().click();
  const relationshipTitle = page.locator('[data-relationship-explorer] .relationship-explorer__masthead h2');
  await expect(relationshipTitle).toContainText('같은 벡터 공간은 무엇을 보장하는가: 공기·대조·생성의 경계');

  await page.goto(siteUrl('/analyses/?view=cards'));
  const directoryTitle = page.locator('[data-card-title="같은 벡터 공간은 무엇을 보장하는가 — 공기·대조·생성의 경계"] h2');
  await expect(directoryTitle).toContainText('같은 벡터 공간은 무엇을 보장하는가: 공기·대조·생성의 경계');

  await page.goto(siteUrl('/search/?q=같은%20벡터'));
  const fullSearchTitle = page.locator('[data-search-page-results] .search-result-card__link').first();
  await expect(fullSearchTitle).toContainText('같은 벡터 공간은 무엇을 보장하는가: 공기·대조·생성의 경계');

  await page.goto(siteUrl('/'));
  const quickSearch = page.locator('[data-site-search] input:visible').first();
  await quickSearch.fill('같은 벡터');
  const quickSearchTitle = page.locator('[data-site-search]:visible [role="option"] strong').first();
  await expect(quickSearchTitle).toContainText('같은 벡터 공간은 무엇을 보장하는가: 공기·대조·생성의 경계');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(siteUrl('/analyses/같은-벡터-공간은-무엇을-보장하는가-공기-대조-생성의-경계/'));
  await expect(page.locator('.article-title-block h1')).toHaveText('같은 벡터 공간은 무엇을 보장하는가: 공기·대조·생성의 경계');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('learning guide has a canonical route, navigation entry, and progressive enhancement hook', async ({ page }) => {
  await page.goto(siteUrl('/'));
  const guideCta = page.locator('[data-learning-guide-cta]');
  await expect(guideCta).toBeVisible();
  await expect(guideCta).toHaveAttribute('href', `${siteUrl('/guide/')}#3분-출발-진단`);

  await guideCta.click();
  await expect.poll(() => decodeURIComponent(new URL(page.url()).hash)).toBe('#3분-출발-진단');
  await expect(page.locator('[data-learning-guide-page]')).toBeVisible();
  await expect(page.locator('[data-desktop-nav] a[href="' + siteUrl('/guide/') + '"]')).toHaveAttribute('aria-current', 'page');
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
