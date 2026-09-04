const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('file://' + __dirname + '/ptit-comptable-onepager.html');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'onepager_top.png' });
  await page.screenshot({ path: 'onepager_full.png', fullPage: true });
  await browser.close();
})();
