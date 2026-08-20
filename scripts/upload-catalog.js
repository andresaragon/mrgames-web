// Script de carga masiva: sube las 628 carátulas a Supabase Storage
// y crea los 628 productos (inactivos, precio 0, stock 1) en la tabla products.
// Uso: node scripts/upload-catalog.js   (ejecutar desde la raíz de mrgames-web)

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// --- Leer .env.local manualmente (sin dependencias extra) ---
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')
const env = {}
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY)

const CSV_PATH = '/mnt/d/Claude/catalogo_titulos_completo.csv'
const IMAGES_DIR = '/mnt/d/Claude/covers_final'
const BUCKET = 'product-images'

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function parseCsv(content) {
  const lines = content.trim().split('\n')
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const commaIndex = line.indexOf(',')
    const archivo = line.slice(0, commaIndex).trim()
    let titulo = line.slice(commaIndex + 1).trim()
    if (titulo.startsWith('"') && titulo.endsWith('"')) {
      titulo = titulo.slice(1, -1).replace(/""/g, '"')
    }
    rows.push({ archivo, titulo })
  }
  return rows
}

async function main() {
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  const rows = parseCsv(csvContent)
  console.log(`Total filas en CSV: ${rows.length}`)

  let uploaded = 0
  let inserted = 0
  const errors = []

  for (const row of rows) {
    const num = row.archivo.match(/\d+/)[0]
    const filePath = path.join(IMAGES_DIR, row.archivo)
    const fileBuffer = fs.readFileSync(filePath)
    const storagePath = `products/${row.archivo}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, { contentType: 'image/jpeg', upsert: true })

    if (uploadError) {
      errors.push({ file: row.archivo, step: 'upload', error: uploadError.message })
      continue
    }
    uploaded++

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
    const slug = `${slugify(row.titulo)}-${num}`

    const { error: insertError } = await supabase.from('products').insert({
      name: row.titulo,
      slug,
      description: null,
      price: 0,
      stock: 1,
      platform: 'Xbox',
      condition: 'nuevo',
      image_url: publicUrlData.publicUrl,
      active: false,
    })

    if (insertError) {
      errors.push({ file: row.archivo, step: 'insert', error: insertError.message })
      continue
    }
    inserted++

    if (inserted % 50 === 0) {
      console.log(`Progreso: ${inserted}/${rows.length}`)
    }
  }

  console.log(`\nListo. Subidas: ${uploaded}, Insertados: ${inserted}, Errores: ${errors.length}`)
  if (errors.length) {
    fs.writeFileSync('upload-errors.json', JSON.stringify(errors, null, 2))
    console.log('Detalle de errores guardado en upload-errors.json')
  }
}

main()
