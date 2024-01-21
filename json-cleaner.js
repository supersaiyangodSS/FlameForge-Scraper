import fs from 'fs';
import puppeteer from 'puppeteer';

async function scrapeData(url) {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  console.log(`Navigating to ${url}...`);
  await page.goto(url);

  const scrapedData = [];

  // Extract links from the specified HTML element
  const links = await page.evaluate(() => {
    const linkElements = document.querySelectorAll('.wpb_column .wpb_text_column a')
    return Array.from(linkElements, (link) => link.href);
  });

  console.log(`Found ${links.length} links. Scraping data from each link...`);

  // Loop through links and scrape data
  for (const link of links) {
    console.log(`Navigating to link: ${link}`);
    await page.goto(link);

    // Extract data from the current page
    const data = await page.evaluate(() => {
      const contentElement = document.querySelector('.wpb_wrapper');
      return contentElement ? contentElement.innerText : null;
    });

    // Add the extracted data to the array
    if (data) {
      scrapedData.push({ link, content: data });
      console.log(`Scraped data from ${link}`);
    }
  }

  // Save the array to a JSON file
  fs.writeFileSync('scrapedData.json', JSON.stringify(scrapedData, null, 2));

  console.log('Scraping complete. Data saved to scrapedData.json.');

  await browser.close();
}

// Replace 'your_url_here' with the actual URL you want to scrape
scrapeData('https://www.astromantra.com/stotra/');
