const fs = require('fs');
const csvParser = require('csv-parser');

async function getResults(gap) {
  const results = [];
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream('data.csv')
      .pipe(csvParser({ skipLines: 1, headers: ['date', 'twoPM', 'fourPM', 'ninePM'] }))
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', () => {
        const lastIdx = rows.length - 1;
        console.log(rows[lastIdx])
        let currIdx = lastIdx;
        for (let i = 0; i < gap && currIdx >= 0; i++) {
          const row = rows[currIdx];
          results.push(
            `'${row['date']}','${row['twoPM']}','${row['fourPM']}','${row['ninePM']}'`
          );
          currIdx--;
        }
        resolve({ gap, results });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}


(async () => {
  const { gap, results } = await getResults(2);
  // console.log({ gap, results });
})();