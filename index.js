import { CompanyTypes, createScraper } from "israeli-bank-scrapers";
import dotenv from "dotenv";

dotenv.config();

const parseBudget = () => {
  const budget = Number(process.env.BUDGET_ILS);
  if (isNaN(budget)) {
    throw new Error("Budget is not a number");
  }
  return budget;
};

const scrape = async () => {
  const now = new Date();
  const options = {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    companyId: CompanyTypes.isracard,
    showBrowser: false,
  };

  const credentials = {
    id: process.env.CREDENTIALS_ID,
    card6Digits: process.env.CREDENTIALS_CARD_DIGITS,
    password: process.env.CREDENTIALS_PASSWORD,
  };

  const scraper = createScraper(options);
  const scrapeResult = await scraper.scrape(credentials);

  if (!scrapeResult.success) {
    throw new Error(
      `Failed to scrape: ${scrapeResult.errorType}: ${scrapeResult.errorMessage}`
    );
  }
  return scrapeResult;
};

const getTotalCharged = (scrapeResult) => {
  let totalCharged = 0;
  scrapeResult.accounts.forEach((account) => {
    account.txns.forEach((txn) => {
      // The charge amount is negative.
      totalCharged -= txn.chargedAmount;
    });
  });
  return totalCharged;
};

const main = async () => {
  const budget = parseBudget();
  const scrapeResult = await scrape();
  const totalCharged = getTotalCharged(scrapeResult);
  if (totalCharged > budget) {
    console.log(`Budget exceeded: ${totalCharged}`);
  } else {
    console.log(`Total charged: ${totalCharged}`);
  }
};

main();
