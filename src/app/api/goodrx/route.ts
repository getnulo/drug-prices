import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

async function selectDosage(page: puppeteer.Page, dosage: string) {
  try {
    // Wait for dosage selector dropdown or list (example selector)
    await page.waitForSelector('select#dosage-selector, .dosage-list', { timeout: 3000 });
    // If dropdown:
    if (await page.$('select#dosage-selector')) {
      await page.select('select#dosage-selector', dosage);
      await page.waitForTimeout(1000); // Wait for prices to update
    }
    // Otherwise click on list element matching dosage text:
    else {
      const dosageOption = await page.$x(`//li[contains(text(), "${dosage}")]`);
      if (dosageOption.length > 0) {
        await dosageOption[0].click();
        await page.waitForTimeout(1000);
      }
    }
  } catch {
    // Dosage selection element not found, continue silently
  }
}

async function enterZipCode(page: puppeteer.Page, zip: string) {
  try {
    // Check if a ZIP entry modal or popup appears
    await page.waitForSelector('input#zip-code-input, input[name="zip"]', { timeout: 3000 });
    // Enter ZIP number
    await page.type('input#zip-code-input, input[name="zip"]', zip, { delay: 50 });
    // Submit ZIP, e.g., click "Apply" or similar button
    const applyButton = await page.$('button#apply-zip, button.apply-zip');
    if (applyButton) {
      await applyButton.click();
    }
    await page.waitForTimeout(1500); // Wait for prices to update for new ZIP
  } catch {
    // ZIP modal not found or input absent, continue silently
  }
}

export async function POST(req: Request) {
  try {
    const { drugName, dosage, zip } = await req.json();
    if (!drugName || !zip) {
      return NextResponse.json({ error: "Missing drugName or zip" }, { status: 400 });
    }

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    await page.goto('https://www.goodrx.com/', { waitUntil: 'networkidle2' });

    // Search drug:
    await page.type('input[name="query"]', drugName);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.keyboard.press('Enter'),
    ]);

    // Select dosage on results page
    await selectDosage(page, dosage);

    // Enter ZIP code for location-based pricing
    await enterZipCode(page, zip);

    // Wait for price container to appear
    await page.waitForSelector('.price-list, .card, .pricing', { timeout: 5000 });

    // Extract offers
    const offers = await page.evaluate(() => {
      // Adapt selectors to current GoodRx DOM structure:
      const offerNodes = document.querySelectorAll('.price-list > .price-list-item, .card, .pricing');
      const data = [];
      offerNodes.forEach((node) => {
        const pharmacyName = node.querySelector('.pharmacy-name')?.textContent?.trim() || null;
        const priceText = node.querySelector('.price')?.textContent?.trim() || null;
        if (priceText) {
          const price = parseFloat(priceText.replace(/\$|,/g, ''));
          data.push({
            pharmacyName,
            price,
            rawPriceText: priceText,
          });
        }
      });
      return data;
    });

    await browser.close();
    return NextResponse.json({ offers });

  } catch (error) {
    console.error("GoodRx scraping error:", error);
    return NextResponse.json({ error: "Failed to scrape GoodRx" }, { status: 500 });
  }
}
