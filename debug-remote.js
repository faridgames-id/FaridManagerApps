const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
  );

  console.log('Navigating to https://farid-manager-apps.vercel.app');
  await page.goto('https://farid-manager-apps.vercel.app', { waitUntil: 'networkidle2' });

  // Wait a little bit for hydration and any React errors
  await new Promise(r => setTimeout(r, 4000));

  await browser.close();
})();
