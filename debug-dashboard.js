const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
      if (msg.type() === 'error') {
          console.log('PAGE ERROR LOG:', msg.text());
      }
  });
  page.on('pageerror', error => console.log('PAGE UNCAUGHT ERROR:', error.message));

  console.log('Navigating to http://localhost:54971');
  
  // Navigate to a blank page first to set localStorage
  await page.goto('http://localhost:54971');
  await page.evaluate(() => {
      localStorage.setItem('ffml_email', 'test@test.com');
  });

  // Now reload
  await page.goto('http://localhost:54971', { waitUntil: 'networkidle2' });

  console.log('Waiting 8 seconds for intro to finish...');
  await new Promise(r => setTimeout(r, 8000));
  
  try {
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const skip = btns.find(b => b.textContent.includes('Lewati'));
          if (skip) skip.click();
      });
      console.log('Clicked skip button (if it existed)');
  } catch(e) {}
  
  await new Promise(r => setTimeout(r, 4000));

  await browser.close();
})();
