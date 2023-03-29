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

async function processArray(gap, arr) {
  try {
    const res1 = [...arr[0].split(`'',''`)].map((e) => e.replace(/(['"])(.*?)/g, ""));
    const res2 = [...arr[1].split(`'',''`)].map((e) => e.replace(/(['"])(.*?)/g, ""));
    const res3 = [...arr[2].split(`'',''`)].map((e) => e.replace(/(['"])(.*?)/g, ""));
    
    // check for 'N/D'
    const hasND = [res1, res2, res3].some(arr => arr.includes('N/D'));

    if (!hasND) {
      const p1 = Array.from(new Set([res1[1], res1[2], res1[3]].map(e => generatePermutations(e)).flat()));
      const p2 = Array.from(new Set([res2[1], res2[2], res2[3]].map(e => generatePermutations(e)).flat()));
      const p3 = Array.from(new Set([res3[1], res3[2], res3[3]].map(e => generatePermutations(e)).flat()));
      const result = p1.filter(num => p2.includes(num) && p3.includes(num));

      if (result.length != 0) {
        const arr1 = res1.slice(1,res1.length)
        const arr3 = res3.slice(1,res3.length)

        for (let i = 0; i < arr1.length; i++) {
          for (let j = 0; j < arr3.length; j++) {

            const s1 = arr1[i].split('').sort().join('')
            const s3 = arr3[j].split('').sort().join('')

            if (s1 === s3) {
              console.log('gap:', gap)
              console.log('pair:', result)
              console.log(res1)
              console.log(res2)
              console.log(res3)
              console.log('\n')
            }
          }
        }

      }
      
    };
  }
  catch (error) {
    console.error(error);
  }
}




(async () => {

  for (let i = 1; i <= 300; i++) {
    const {gap: gap, results: res} = await getGapResults(i);
    processArray(gap, res)
  }

})(); 