const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:3000');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  console.log('Waiting 8 seconds for intro to finish...');
  await new Promise(r => setTimeout(r, 8000));
  
  // also try to click skip button if it's there
  try {
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const skip = btns.find(b => b.textContent.includes('Lewati'));
          if (skip) skip.click();
      });
      console.log('Clicked skip button (if it existed)');
  } catch(e) {}
  
  await new Promise(r => setTimeout(r, 2000));

  await browser.close();
})();
