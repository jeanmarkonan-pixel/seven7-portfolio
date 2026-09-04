const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
  await page.goto('file://' + __dirname + '/aura-compta-preview.html');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'aura_preview.png' });
  await browser.close();
})();
