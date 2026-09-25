const https = require('https');
const fs = require('fs');

// Leer API key
const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/STEAMGRIDDB_API_KEY=(.*)/);
const API_KEY = keyMatch ? keyMatch[1].trim() : '';

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
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data: null });
          }
        });
      }
    ).on('error', reject);
  });
}

function cleanTitle(title) {
  // Limpiar sufijos como "Xbox", "Edition", etc. para maximizar coincidencia
  return title
    .replace(/\s*\+\s*Battlefield\s*1943/i, '')
    .replace(/Special Edition/i, '')
    .replace(/Revolution Edition/i, '')
    .replace(/Deluxe Edition/i, '')
    .trim();
}

async function findCover(gameName) {
  const query = cleanTitle(gameName);
  const searchUrl = `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(query)}`;
  const searchRes = await get(searchUrl);

  if (!searchRes.data?.data || searchRes.data.data.length === 0) {
    return null;
  }

  const game = searchRes.data.data[0];
  const gridsUrl = `https://www.steamgriddb.com/api/v2/grids/game/${game.id}?dimensions=600x900`;
  const gridsRes = await get(gridsUrl);

  if (!gridsRes.data?.data || gridsRes.data.data.length === 0) {
    return null;
  }

  // Tomar la primera carátula con mejor puntuación
  return {
    gameId: game.id,
    matchedName: game.name,
    coverUrl: gridsRes.data.data[0].url,
    thumbUrl: gridsRes.data.data[0].thumb,
  };
}

async function runPilot() {
  const sampleGames = [
    'Far Cry 4',
    'Battlefield 1 Revolution Edition + Battlefield 1943',
    'Deus Ex Mankind Divided',
    'The Elder Scrolls V Skyrim Special Edition',
    'L.A. Noire',
  ];

  console.log('=== PRUEBA PILOTO STEAMGRIDDB (5 JUEGOS) ===\n');

  for (const name of sampleGames) {
    console.log(`Buscando: "${name}"...`);
    const result = await findCover(name);
    if (result) {
      console.log(` -> Coincidencia: "${result.matchedName}"`);
      console.log(` -> Carátula Oficial 600x900: ${result.coverUrl}\n`);
    } else {
      console.log(` -> No se encontró carátula.\n`);
    }
  }
}

runPilot();
