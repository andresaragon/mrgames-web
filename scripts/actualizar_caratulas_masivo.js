const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// --- 1. CONFIGURACIÓN Y CLIENTES ---
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const API_KEY = env.STEAMGRIDDB_API_KEY || '';
if (!API_KEY) {
  console.error('ERROR: STEAMGRIDDB_API_KEY no encontrada en .env.local');
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);
const BUCKET = 'product-images';
const DELAY_MS = 250; // Respetar rate limits

// --- 2. UTILIDADES DE RED ---
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

const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- 3. NORMALIZACIÓN Y SEGURIDAD (MAKER-CHECKER) ---
const NUM_WORDS = {
  '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
  '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten',
  '11': 'eleven', '12': 'twelve'
};

function normalizeTokens(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function wordSimilarity(str1, str2) {
  const t1 = normalizeTokens(str1);
  const t2 = normalizeTokens(str2);
  if (t1.length === 0 || t2.length === 0) return 0;
  
  const s1 = new Set(t1);
  const s2 = new Set(t2);
  let common = 0;
  for (const w of s1) {
    if (s2.has(w)) common++;
  }
  return common / Math.min(s1.size, s2.size);
}

function cleanTitle(title) {
  return title
    .replace(/\s*\+\s*.*$/i, '')
    .replace(/\b(deluxe|gold|ultimate|special|revolution|complete|premium|collector'?s?|remastered|enhanced|definitive|anniversary)\s+edition\b/gi, '')
    .replace(/\b(bundle|collection|remastered|romastered|hd|trilogy|pass|season)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleWithWordsForNumbers(title) {
  return title.replace(/\b(\d+)\b/g, (match, num) => NUM_WORDS[num] || match);
}

// --- 4. BÚSQUEDA DE PORTADA STEAMGRIDDB ---
async function findBestCover(productName) {
  const strategies = [
    productName,
    cleanTitle(productName),
    titleWithWordsForNumbers(productName),
    cleanTitle(titleWithWordsForNumbers(productName)),
  ];

  const uniqueQueries = [...new Set(strategies.map(s => s.trim()).filter(Boolean))];

  for (const query of uniqueQueries) {
    const searchUrl = `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(query)}`;
    const searchRes = await getJson(searchUrl);

    if (!searchRes.data?.success || !searchRes.data.data?.length) {
      await sleep(150);
      continue;
    }

    // Filtrar candidatos con similitud suficiente
    const candidates = searchRes.data.data;
    let bestGame = null;

    for (const c of candidates) {
      const sim = wordSimilarity(query, c.name);
      if (sim >= 0.65) {
        bestGame = c;
        break;
      }
    }

    if (bestGame) {
      // Buscar carátulas 600x900
      const gridsUrl = `https://www.steamgriddb.com/api/v2/grids/game/${bestGame.id}?dimensions=600x900`;
      const gridsRes = await getJson(gridsUrl);

      if (gridsRes.data?.success && gridsRes.data.data?.length) {
        // Filtrar imágenes seguras y oficiales
        const safeGrids = gridsRes.data.data.filter(g => !g.nsfw && !g.humor && !g.epilepsy);
        if (safeGrids.length > 0) {
          const selected = safeGrids[0];
          return {
            gameId: bestGame.id,
            matchedName: bestGame.name,
            coverUrl: selected.url,
            similarity: wordSimilarity(query, bestGame.name)
          };
        }
      }
    }

    await sleep(150);
  }

  return null;
}

// --- 5. EJECUCIÓN PRINCIPAL ---
async function main() {
  console.log('========================================================');
  console.log('🚀 MIGRACIÓN MASIVA DE CARÁTULAS A STEAMGRIDDB HD (600x900)');
  console.log('========================================================\n');

  // Obtener todos los productos
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, image_url')
    .order('name');

  if (error) {
    console.error('Error al obtener productos:', error);
    process.exit(1);
  }

  console.log(`📦 Total de productos en base de datos: ${products.length}`);

  let updatedCount = 0;
  let skippedAlreadyUpdated = 0;
  let skippedNoMatch = 0;
  let errorCount = 0;

  const noMatches = [];
  const report = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const prefix = `[${i + 1}/${products.length}]`;

    // Si ya tiene una carátula HD en /covers/, omitir para no re-descargar
    if (p.image_url && p.image_url.includes('/product-images/covers/')) {
      skippedAlreadyUpdated++;
      continue;
    }

    try {
      const cover = await findBestCover(p.name);

      if (!cover) {
        skippedNoMatch++;
        noMatches.push({ id: p.id, name: p.name, slug: p.slug, current_image: p.image_url });
        console.log(`${prefix} ⚠️  Sin coincidencia segura: "${p.name}" (se conserva carátula actual)`);
        await sleep(DELAY_MS);
        continue;
      }

      // Descargar imagen
      const imgBuffer = await downloadBuffer(cover.coverUrl);
      const ext = cover.coverUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
      const storagePath = `covers/${p.slug}.${ext}`;

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, imgBuffer, {
          contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error(`${prefix} ❌ Error subiendo a Storage para "${p.name}":`, uploadError.message);
        errorCount++;
        await sleep(DELAY_MS);
        continue;
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      const newImageUrl = publicUrlData.publicUrl;

      // Actualizar base de datos
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: newImageUrl })
        .eq('id', p.id);

      if (updateError) {
        console.error(`${prefix} ❌ Error actualizando DB para "${p.name}":`, updateError.message);
        errorCount++;
      } else {
        updatedCount++;
        console.log(`${prefix} ✅ "${p.name}" -> Coincidencia: "${cover.matchedName}" (${Math.round(cover.similarity * 100)}%)`);
        report.push({
          name: p.name,
          slug: p.slug,
          matchedName: cover.matchedName,
          similarity: cover.similarity,
          newImageUrl
        });
      }

    } catch (err) {
      console.error(`${prefix} ❌ Excepción en "${p.name}":`, err.message);
      errorCount++;
    }

    await sleep(DELAY_MS);
  }

  console.log('\n========================================================');
  console.log('📊 RESUMEN FINAL DE LA MIGRACIÓN');
  console.log('========================================================');
  console.log(`✅ Carátulas actualizadas a HD Oficial: ${updatedCount}`);
  console.log(`⏩ Ya estaban en HD (omitidas):        ${skippedAlreadyUpdated}`);
  console.log(`⚠️  Sin coincidencia (conservadas):    ${skippedNoMatch}`);
  console.log(`❌ Errores de descarga/subida:         ${errorCount}`);
  console.log('========================================================\n');

  // Guardar reportes forenses
  fs.writeFileSync(
    path.join(__dirname, 'migration_report.json'),
    JSON.stringify({ updatedCount, skippedAlreadyUpdated, skippedNoMatch, errorCount, noMatches, report }, null, 2)
  );
  console.log('📄 Reporte guardado en scripts/migration_report.json');
}

main();
