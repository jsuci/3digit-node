require("dotenv").config();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvParser = require('csv-parser');
const fs = require('fs');
const puppeteer = require('puppeteer');
const arg1 = process.argv[2];
const url1 = 'https://www.pinoyswertres.com/pcso-swertres-result-history-';
const url2 = 'https://www.pinoyswertres.com/swertres-result-history-';




(async () => {

  // Load existing data from the CSV file
  let existingData = [];
  fs.access('data.csv', fs.constants.F_OK, (err) => {
    if (err) {
      fs.writeFileSync('data.csv', 'date,twoPM,fourPM,ninePM\n', 'utf8');
    }
    fs.createReadStream('data.csv')
      .pipe(csvParser({ skipLines: 1, headers: ['date', 'twoPM', 'fourPM', 'ninePM'] }))
      .on('data', data => {
        existingData.push(data);
      })
      .on('end', () => {
        console.log(`Reading ${existingData.length} entries from file`);
      });
  });
  


  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const currentYear = new Date().getFullYear();
  let startYear = 2009;

  if (!arg1) {
    startYear = currentYear;
  }

  while (startYear <= currentYear) {
    let fullURL = '';

    if (startYear >= 2021) {
      fullURL = url2 + startYear
    } else {
      fullURL = url1 + startYear
    }

    console.log(`Opening ${fullURL}...`)

    await page.goto(fullURL);

    // Scrape the data from the page using Puppeteer
    const results = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('tr')).slice(1)
        .map(tr => {
          const tdArray = Array.from(tr.children).map(td => td.innerText);
          const dateString = tdArray[0];
          const date = new Date(dateString);
          // const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
          const formattedDate = date.toLocaleDateString('default', { month: 'short', day: '2-digit', year: 'numeric' });

          return {
            date: `'${formattedDate}'`,
            twoPM: `'${tdArray[1].replace(/-/g, "")}'`,
            fourPM: `'${tdArray[2].replace(/-/g, "")}'`,
            ninePM: `'${tdArray[3].replace(/-/g, "")}'`,
          };

        });
    });

    const filteredResults = results.filter(result => {
      return !result.date.includes("Invalid Date");
    });

    startYear++;

    console.log(`Added ${filteredResults.length} results to ${existingData.length} existing data...`);

    // Add new data to the existing data
    filteredResults.forEach(data => {

      // console.log(data)

      // Check if the data already exists in the existing data
      const existingDataIndex = existingData.findIndex(existingData => existingData.date === data.date && existingData.twoPM === data.twoPM);

      // If the data exists, replace it with the new data
      if (existingDataIndex !== -1) {
        existingData[existingDataIndex] = data;
      }
      // If the data doesn't exist, add it to the existing data
      else {
        // console.log(data, 'is added...')
        existingData.push(data);
      }
    });

    // Sort data base on date
    existingData.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });


    const csvWriter = createCsvWriter({
      path: 'data.csv',
      header: [
        {id: 'date', title: 'date'},
        {id: 'twoPM', title: 'twoPM'},
        {id: 'fourPM', title: 'fourPM'},
        {id: 'ninePM', title: 'ninePM'},
      ],
      append: false
    });

    csvWriter.writeRecords(existingData)
      .then(() => {
        console.log(`${existingData.length} data added to the CSV file...\n`);
    });

  }

  await browser.close();
})();
