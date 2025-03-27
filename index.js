// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");
  
  //defining variables at the begining so they can be easily changed if needed
  let totalresultsTested = 100;
  let resultsPerPage = 30;
  let wasError = false;
  errorMessge = "";

  //Initialzing previousRankID and previousRankDate so I can use them later in the loop
  let previousRankId = await page.locator('tr.athing').filter({ has: page.locator('span.rank'), hasText: `1.` }).nth(0).getAttribute('id');
  let previousRankDate = new Date(await page.locator(`span.subline`).filter({ has:page.locator(`[id="score_${previousRankId}"]`)}).locator('span.age').getAttribute('title'));

  for (let rank = 1; rank <= totalresultsTested; rank++) {
   
    //Get the Id for the table row using the rank
    const rankId = await page.locator('tr.athing').filter({ has: page.locator('span.rank'), hasText: `${rank}.` }).nth(0).getAttribute('id');

    //Get the age of the table row associated with the rank and store it as a Date object for comparison
    const rankDate = new Date(await page.locator(`span.subline`).filter({ has:page.locator(`[id="score_${rankId}"]`)}).locator('span.age').getAttribute('title'));
    
    //skip the first time since there is no previous information
    if(rank != 1) {
      if(previousRankDate < rankDate){
        //If there are errors Accumulate them into a 
        errorMessge += `At Rank:${rank}, post Id:${rankId} with an timestamp of ${rankDate} was later than rank:${rank-1} postId:${previousRankId} with a timestamp of ${previousRankDate}. \n `;
        wasError = true;
      }
    }
    
    //Save the rankId and rankDate to be used in the next loop
    previousRankId = rankId;
    previousRankDate = rankDate;

    //if we have reached the end of the page click the more results button
    if(rank % resultsPerPage == 0){
      await page.locator('.morelink').click();
    }
  }

  if(wasError){
    throw new Error(errorMessge)
  }
  console.log("Test Complete");
}
(async () => {
  await sortHackerNewsArticles();
})();
