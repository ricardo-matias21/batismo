const http = require('https');

function translateFree(text) {
  return new Promise((resolve) => {
    if (!text || !text.trim()) return resolve('');
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const translated = parsed[0].map(item => item[0]).join('');
          resolve(translated);
        } catch (e) {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
}

async function runTest() {
  const title = "Comprar o Bacalhau da Tradição";
  const desc = "Ir à mercearia tradicional e trazer uma rodada de imperiais bem geladas";
  
  const titleEn = await translateFree(title);
  const descEn = await translateFree(desc);
  
  console.log("PT Title:", title);
  console.log("EN Title:", titleEn);
  console.log("PT Desc:", desc);
  console.log("EN Desc:", descEn);
}

runTest();
