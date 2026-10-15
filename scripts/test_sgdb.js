const fs = require('fs');
const path = require('path');
const https = require('https');

// La clave se lee de .env.local (nunca en el codigo: este repo es publico).
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const keyMatch = envContent.match(/^STEAMGRIDDB_API_KEY=(.*)$/m);
const API_KEY = keyMatch ? keyMatch[1].trim() : '';
if (!API_KEY) {
  console.error('ERROR: STEAMGRIDDB_API_KEY no encontrada en .env.local');
  process.exit(1);
}

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'User-Agent': 'MrGames/1.0',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      }
    ).on('error', reject);
  });
}

async function test() {
  console.log('1. Buscando juego: Far Cry 4...');
  const searchRes = await get(
    'https://www.steamgriddb.com/api/v2/search/autocomplete/Far%20Cry%204'
  );
  console.log('Search Status:', searchRes.status, 'Results:', searchRes.data.data?.length);

  if (searchRes.data.data && searchRes.data.data.length > 0) {
    const game = searchRes.data.data[0];
    console.log('Juego encontrado:', game.name, 'ID:', game.id);

    console.log('\n2. Buscando carátulas verticales (grids 600x900)...');
    const gridsRes = await get(
      `https://www.steamgriddb.com/api/v2/grids/game/${game.id}?dimensions=600x900`
    );
    console.log('Grids Status:', gridsRes.status, 'Total carátulas:', gridsRes.data.data?.length);

    if (gridsRes.data.data && gridsRes.data.data.length > 0) {
      const topGrid = gridsRes.data.data[0];
      console.log('Carátula oficial HD encontrada:');
      console.log('URL:', topGrid.url);
      console.log('Thumb:', topGrid.thumb);
      console.log('Dimensiones:', `${topGrid.width}x${topGrid.height}`);
      console.log('Score:', topGrid.score);
    }
  }
}

test();
