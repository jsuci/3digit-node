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
  fs.createReadStream('data.csv')
    .pipe(csvParser({skipLines: 1, headers: ['date', '2PM', '4PM', '9PM']}))
    .on('data', data => {
      existingData.push(data);
    })
    .on('end', () => {
      console.log(existingData);
    });


  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const currentYear = new Date().getFullYear();
  let startYear = 2020;

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
            twoPM: `'${tdArray[1]}'`,
            fourPM: `'${tdArray[2]}'`,
            ninePM: `'${tdArray[3]}'`,
          };
        });
    });

    startYear++;

    console.log(`Add results to existing data...\n`, results);

    // Add new data to the existing data
    results.forEach(data => {
      if (data.date === 'DATE') return;


      // Check if the data already exists in the existing data
      const existingDataIndex = existingData.findIndex(existingData => existingData.date === data.date);

      // If the data exists, replace it with the new data
      if (existingDataIndex !== -1) {
        existingData[existingDataIndex] = data;
      }
      // If the data doesn't exist, add it to the existing data
      else {
        existingData.push(data);
      }
    });


    const csvWriter = createCsvWriter({
      path: 'data.csv',
      header: [
        {id: 'date', title: 'DATE'},
        {id: 'twoPM', title: '2PM'},
        {id: 'fourPM', title: '4PM'},
        {id: 'ninePM', title: '9PM'},
      ],
      append: false
    });

    csvWriter.writeRecords(existingData)
      .then(() => {
        console.log('Data added to the CSV file...');
    });

  }

  await browser.close();
})();
