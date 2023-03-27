const fs = require('fs');
const csvParser = require('csv-parser');


// helper functions
function generatePermutations(n) {
  const digits = n.toString().split(''); // convert the number to an array of digits
  const permutations = new Set(); // initialize the set of permutations
  for (let i = 0; i < digits.length; i++) {
    for (let j = 0; j < digits.length; j++) {
      if (i !== j) {
        const permutation = [digits[i], digits[j]].sort().join(''); // sort the digits and concatenate them to form a two-digit number
        permutations.add(permutation); // add the permutation to the set
      }
    }
  }
  return Array.from(permutations); // convert the set back to an array and return it
}

async function getGapResults(gap) {
    
  return new Promise((resolve, reject) => {

    const rows = [];

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

async function processArray(arr) {
  try {
    console.log(arr)
    // for (const str of arr) {
    //   const [date, n1, n2, n3] = [...str.split(`'',''`)].map((e) => e.replace(/(['"])(.*?)/g, ""));
      
    //   // exclude N/D (no draws)
    //   if (!n1.includes('N/D')) {
    //     const [p1, p2, p3] = [n1, n2, n3].map(e => generatePermutations(e))
    //     const result = p1.filter(num => p2.includes(num) && p3.includes(num));

    //     if (result.length != 0) {
    //       // sort results
    //       const [s1, s2, s3] = [n1, n2, n3].map(e => e.split('').sort().join(''))

    //       // check for duplicate results on n1 and n3
    //       console.log(s1, s3)
    //     }
    //   }

    // }
  } catch (error) {
    console.error(error);
  }
}




(async () => {

  // const output = []
  for (let i = 1; i <= 30; i++) {
    const {gap: gap, results: res} = await getGapResults(i);
    processArray(res)
    // output.push({gap, res});
  }

  // console.log(output)
})(); 