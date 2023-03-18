const fs = require('fs');
const csvParser = require('csv-parser');

async function getGapResults(gap) {
  const rows = [];
    
  return new Promise((resolve, reject) => {

    fs.createReadStream('data.csv')
      .pipe(csvParser({ skipLines: 1, headers: ['date', 'twoPM', 'fourPM', 'ninePM'] }))
      .on('data', (row) => {
        rows.unshift(row);
      })
      .on('end', () => {
        let results = [];
        let gapCounter = 0;
        let row;

        while (true) {
          if (results.length === 3) {
            break
          }

          gapCounter += gap;
          
          row = rows[gapCounter]
          results.push(`'${row['date']}','${row['twoPM']}','${row['fourPM']}','${row['ninePM']}'`)
          
          gapCounter += 1;

        }
        
        resolve({ gap, results });

      })
      .on('error', (error) => {
        reject(error);
      });
  });
}


(async () => {

  const output = []
  for (let i = 1; i <= 10; i++) {
    const {gap, results} = await getGapResults(i);
    output.push({gap, results});
  }

  console.log(output)
})(); 