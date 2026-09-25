const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// 1. CONFIGURACIÓN Y CLIENTES
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const API_KEY = env.STEAMGRIDDB_API_KEY || '';
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);
const BUCKET = 'product-images';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 2. UTILIDADES DE RED
function getJson(url) {
  return new Promise((resolve) => {
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
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data: null });
          }
        });
      }
    ).on('error', () => resolve({ status: 500, data: null }));
  });
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// 3. LISTA CURADA DE LOS 50 JUEGOS CLAVE DE XBOX
const NEW_GAMES = [
  // Deportes y Simulación
  { name: 'EA Sports FC 25', slug: 'ea-sports-fc-25-xbox', price: 149000, query: 'EA SPORTS FC 25' },
  { name: 'EA Sports FC 24', slug: 'ea-sports-fc-24-xbox', price: 119000, query: 'EA SPORTS FC 24' },
  { name: 'NBA 2K25', slug: 'nba-2k25-xbox', price: 139000, query: 'NBA 2K25' },
  { name: 'NBA 2K24', slug: 'nba-2k24-xbox', price: 99000, query: 'NBA 2K24' },
  { name: 'WWE 2K24', slug: 'wwe-2k24-xbox', price: 119000, query: 'WWE 2K24' },
  { name: 'The Crew Motorfest', slug: 'the-crew-motorfest-xbox', price: 119000, query: 'The Crew Motorfest' },
  { name: 'TopSpin 2K25', slug: 'topspin-2k25-xbox', price: 119000, query: 'TopSpin 2K25' },

  // Exclusivos & Franquicias Microsoft
  { name: 'Forza Horizon 5', slug: 'forza-horizon-5-xbox', price: 109900, query: 'Forza Horizon 5' },
  { name: 'Forza Motorsport (2023)', slug: 'forza-motorsport-2023-xbox', price: 129000, query: 'Forza Motorsport' },
  { name: 'Halo Infinite', slug: 'halo-infinite-xbox', price: 99000, query: 'Halo Infinite' },
  { name: 'Starfield', slug: 'starfield-xbox', price: 129000, query: 'Starfield' },
  { name: 'Senua\'s Saga: Hellblade II', slug: 'senuas-saga-hellblade-2-xbox', price: 129000, query: 'Hellblade II' },
  { name: 'Hi-Fi RUSH', slug: 'hi-fi-rush-xbox', price: 89000, query: 'Hi-Fi RUSH' },
  { name: 'Indiana Jones and the Great Circle', slug: 'indiana-jones-and-the-great-circle-xbox', price: 149000, query: 'Indiana Jones and the Great Circle' },
  { name: 'S.T.A.L.K.E.R. 2: Heart of Chornobyl', slug: 'stalker-2-heart-of-chornobyl-xbox', price: 139000, query: 'S.T.A.L.K.E.R. 2' },

  // Blockbusters & Mundos Abiertos
  { name: 'Elden Ring', slug: 'elden-ring-xbox', price: 129000, query: 'Elden Ring' },
  { name: 'Elden Ring: Shadow of the Erdtree', slug: 'elden-ring-shadow-of-the-erdtree-xbox', price: 149000, query: 'Shadow of the Erdtree' },
  { name: 'Hogwarts Legacy', slug: 'hogwarts-legacy-xbox', price: 119000, query: 'Hogwarts Legacy' },
  { name: 'Baldur\'s Gate 3', slug: 'baldurs-gate-3-xbox', price: 139000, sgdbId: 5138060 },
  { name: 'Cyberpunk 2077: Phantom Liberty', slug: 'cyberpunk-2077-phantom-liberty-xbox', price: 119000, query: 'Cyberpunk 2077: Phantom Liberty' },
  { name: 'Assassin\'s Creed Mirage', slug: 'assassins-creed-mirage-xbox', price: 119000, query: 'Assassin\'s Creed Mirage' },
  { name: 'Star Wars Jedi: Survivor', slug: 'star-wars-jedi-survivor-xbox', price: 119000, query: 'Star Wars Jedi: Survivor' },
  { name: 'Star Wars Outlaws', slug: 'star-wars-outlaws-xbox', price: 149000, query: 'Star Wars Outlaws' },
  { name: 'Avatar: Frontiers of Pandora', slug: 'avatar-frontiers-of-pandora-xbox', price: 129000, query: 'Avatar: Frontiers of Pandora' },
  { name: 'Palworld', slug: 'palworld-xbox', price: 99000, query: 'Palworld' },

  // Shooters & Acción
  { name: 'Call of Duty: Black Ops 6', slug: 'call-of-duty-black-ops-6-xbox', price: 149000, query: 'Black Ops 6' },
  { name: 'Call of Duty: Modern Warfare III', slug: 'call-of-duty-modern-warfare-3-xbox', price: 129000, query: 'Modern Warfare III' },
  { name: 'Call of Duty: Modern Warfare II', slug: 'call-of-duty-modern-warfare-2-xbox', price: 119000, query: 'Modern Warfare II' },
  { name: 'Warhammer 40,000: Space Marine 2', slug: 'warhammer-40000-space-marine-2-xbox', price: 149000, sgdbId: 5309406 },
  { name: 'Remnant 2', slug: 'remnant-2-xbox', price: 109900, query: 'Remnant II' },
  { name: 'Payday 3', slug: 'payday-3-xbox', price: 99000, query: 'PAYDAY 3' },
  { name: 'RoboCop: Rogue City', slug: 'robocop-rogue-city-xbox', price: 109900, query: 'RoboCop: Rogue City' },
  { name: 'Atomic Heart', slug: 'atomic-heart-xbox', price: 109900, query: 'Atomic Heart' },

  // Survival Horror & Terror
  { name: 'Resident Evil 4 Remake (2023)', slug: 'resident-evil-4-remake-xbox', price: 129000, sgdbId: 5332120 },
  { name: 'Alan Wake 2', slug: 'alan-wake-2-xbox', price: 129000, query: 'Alan Wake 2' },
  { name: 'Dead Space Remake', slug: 'dead-space-remake-xbox', price: 119000, sgdbId: 5338378 },
  { name: 'Dead Island 2', slug: 'dead-island-2-xbox', price: 119000, query: 'Dead Island 2' },
  { name: 'Alone in the Dark (2024)', slug: 'alone-in-the-dark-2024-xbox', price: 119000, query: 'Alone in the Dark' },

  // RPG, Souls-like & Fantasía
  { name: 'Diablo IV', slug: 'diablo-4-xbox', price: 129000, query: 'Diablo IV' },
  { name: 'Lies of P', slug: 'lies-of-p-xbox', price: 119000, query: 'Lies of P' },
  { name: 'Dragon\'s Dogma 2', slug: 'dragons-dogma-2-xbox', price: 139000, query: 'Dragon\'s Dogma 2' },
  { name: 'Armored Core VI: Fires of Rubicon', slug: 'armored-core-6-fires-of-rubicon-xbox', price: 129000, query: 'ARMORED CORE VI' },
  { name: 'Lords of the Fallen (2023)', slug: 'lords-of-the-fallen-2023-xbox', price: 119000, sgdbId: 5348344 },
  { name: 'Persona 3 Reload', slug: 'persona-3-reload-xbox', price: 129000, query: 'Persona 3 Reload' },
  { name: 'Like a Dragon: Infinite Wealth', slug: 'like-a-dragon-infinite-wealth-xbox', price: 129000, query: 'Like a Dragon: Infinite Wealth' },
  { name: 'Dragon Age: The Veilguard', slug: 'dragon-age-the-veilguard-xbox', price: 149000, query: 'Dragon Age: The Veilguard' },

  // Lucha & Plataformas
  { name: 'Mortal Kombat 1 (2023)', slug: 'mortal-kombat-1-2023-xbox', price: 129000, query: 'Mortal Kombat 1' },
  { name: 'Tekken 8', slug: 'tekken-8-xbox', price: 139000, query: 'Tekken 8' },
  { name: 'Street Fighter 6', slug: 'street-fighter-6-xbox', price: 129000, query: 'Street Fighter 6' },
  { name: 'Prince of Persia: The Lost Crown', slug: 'prince-of-persia-the-lost-crown-xbox', price: 109900, query: 'Prince of Persia The Lost Crown' },
];

async function resolveCover(game) {
  let gameId = game.sgdbId;
  let matchedName = game.name;

  if (!gameId) {
    const searchUrl = `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(game.query)}`;
    const searchRes = await getJson(searchUrl);
    if (!searchRes.data?.data?.length) return null;

    // Filtrar herramientas/mods
    const cleanGames = searchRes.data.data.filter(g => !/tool|mod|server|soundtrack/i.test(g.name));
    const target = cleanGames[0] || searchRes.data.data[0];
    gameId = target.id;
    matchedName = target.name;
  }

  // Buscar grids 600x900
  const gridsUrl = `https://www.steamgriddb.com/api/v2/grids/game/${gameId}?dimensions=600x900`;
  const gridsRes = await getJson(gridsUrl);

  if (!gridsRes.data?.data?.length) return null;

  const safeGrids = gridsRes.data.data.filter(g => !g.nsfw && !g.humor && !g.epilepsy);
  const selected = safeGrids[0] || gridsRes.data.data[0];

  return {
    gameId,
    matchedName,
    coverUrl: selected.url
  };
}

async function main() {
  console.log('========================================================');
  console.log('🚀 INYECCIÓN DE 50 GRANDES TÍTULOS DE XBOX (2022-2026)');
  console.log('========================================================\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < NEW_GAMES.length; i++) {
    const g = NEW_GAMES[i];
    const prefix = `[${i + 1}/${NEW_GAMES.length}]`;

    try {
      // 1. Verificar si ya existe en Supabase
      const { data: existing } = await supabase
        .from('products')
        .select('id, name')
        .eq('slug', g.slug)
        .maybeSingle();

      if (existing) {
        console.log(`${prefix} ⏩ Ya existe: "${g.name}" (Slug: ${g.slug})`);
        successCount++;
        continue;
      }

      // 2. Obtener carátula oficial en SteamGridDB
      const cover = await resolveCover(g);
      if (!cover) {
        console.error(`${prefix} ⚠️ No se encontró portada en SGDB para: "${g.name}"`);
        errorCount++;
        await sleep(200);
        continue;
      }

      // 3. Descargar imagen
      const imgBuffer = await downloadBuffer(cover.coverUrl);
      const ext = cover.coverUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
      const storagePath = `covers/${g.slug}.${ext}`;

      // 4. Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, imgBuffer, {
          contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error(`${prefix} ❌ Error subiendo a Storage para "${g.name}":`, uploadError.message);
        errorCount++;
        await sleep(200);
        continue;
      }

      // 5. URL pública de Supabase CDN
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      const imageUrl = publicUrlData.publicUrl;

      // 6. Insertar en tabla products
      const description = `Juego digital garantizado para Xbox One y Xbox Series X|S. Versión completa en alta definición. Disponible para entrega inmediata y cotización en combos por WhatsApp con soporte guiado de Mr Games.`;

      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: g.name,
          slug: g.slug,
          price: g.price,
          description,
          stock: 2,
          platform: 'Xbox',
          condition: 'nuevo',
          image_url: imageUrl,
          active: true,
        });

      if (insertError) {
        console.error(`${prefix} ❌ Error insertando en base de datos:`, insertError.message);
        errorCount++;
      } else {
        successCount++;
        console.log(`${prefix} ✅ "${g.name}" agregado con éxito ($${g.price.toLocaleString('es-CO')} COP)`);
      }

    } catch (err) {
      console.error(`${prefix} ❌ Excepción en "${g.name}":`, err.message);
      errorCount++;
    }

    await sleep(250);
  }

  console.log('\n========================================================');
  console.log('📊 RESUMEN FINAL DE INYECCIÓN DE CATÁLOGO');
  console.log('========================================================');
  console.log(`✅ Títulos listos en catálogo: ${successCount}/50`);
  console.log(`❌ Errores:                    ${errorCount}`);
  console.log('========================================================\n');
}

main();
