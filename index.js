// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function checkPostStructure(page, rankId, rank) {
  const title = await page.locator(`[id ='${rankId}'] span[ class = 'titleline'] `).textContent();
  const link = await page.locator(`[id='${rankId}'] span[ class='titleline'] a`).first().getAttribute('href');
  const scoreText = await page.locator(`#score_${rankId}`).textContent();

  if (!title || !link || !scoreText) {
    return `Post at rank ${rank} is missing title/link/score.\n`;
  }
  return '';
}

function checkTimestampSanity(rankDate, rank) {
  if (rankDate > new Date()) {
    return `Post at rank ${rank} has a future timestamp: ${rankDate}\n`;
  }
  return '';
}

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

  //Initializing Other variables for additial tests
  let seenIds = new Set();

  for (let rank = 1; rank <= totalresultsTested; rank++) {
   
    //Get the Id for the table row using the rank
    const rankId = await page.locator('tr.athing').filter({ has: page.locator('span.rank'), hasText: `${rank}.` }).nth(0).getAttribute('id');


    //Get the age of the table row associated with the rank and store it as a Date object for comparison
    const rankDate = new Date(await page.locator(`span.subline`).filter({ has:page.locator(`[id="score_${rankId}"]`)}).locator('span.age').getAttribute('title'));
    
    //Check for duplicate posts IDs
    if (seenIds.has(rankId)) {
      errorMessge += `Duplicate post ID found at rank ${rank}: ${rankId}\n`;
      wasError = true;
    }
    seenIds.add(rankId);
    

    //Check for valid post structure
    const structureError = await checkPostStructure(page, rankId, rank);
    if (structureError) {
      errorMessge += structureError;
      wasError = true;
    }

    // Check if timestamp is in the future
    const timeError = checkTimestampSanity(rankDate, rank);
    if (timeError) {
      errorMessge += timeError;
      wasError = true;
    }


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
