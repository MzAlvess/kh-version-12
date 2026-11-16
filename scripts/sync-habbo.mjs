#!/usr/bin/env node
/**
 * Gera public/data/figure.json (catálogo de roupas do Habbo imager) a partir de dois arquivos
 * que você baixa pelo navegador:
 *
 *   1. Abra e salve (Ctrl+S) na pasta habbo-data/ do projeto:
 *        https://www.habbo.com.br/gamedata/figuredata/1      → habbo-data/figuredata.xml
 *        https://www.habbo.com.br/gamedata/furnidata_json/1  → habbo-data/furnidata.json
 *   2. Rode:  npm run sync:habbo
 *
 * (Também aceita caminhos: npm run sync:habbo -- caminho/figuredata.xml caminho/furnidata.json)
 *
 * Por que manual: o navegador não deixa o site ler o gamedata do Habbo (sem CORS) e o Habbo
 * bloqueia downloads automáticos. Rode de novo quando o Habbo lançar roupas novas.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const [figurePath = 'habbo-data/figuredata.xml', furniPath = 'habbo-data/furnidata.json'] = process.argv.slice(2)
const OUT = new URL('public/data/figure.json', root)

async function read(path) {
  try {
    return await readFile(new URL(path, root), 'utf8')
  } catch {
    console.error(`Arquivo não encontrado: ${path}\nVeja as instruções no topo de scripts/sync-habbo.mjs`)
    process.exit(1)
  }
}

const attrs = (tag) => Object.fromEntries([...tag.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]))

const xml = await read(figurePath)
const furni = JSON.parse(await read(furniPath))

/* ---------- paletas: { paletteId: [[colorId, hex, club], ...] } (só selecionáveis) ---------- */
const palettes = {}
for (const [, pid, body] of xml.matchAll(/<palette id="(\d+)">([\s\S]*?)<\/palette>/g)) {
  palettes[pid] = [...body.matchAll(/<color ([^>]*)>([0-9A-Fa-f]{6})<\/color>/g)]
    .map(([, a, hex]) => ({ ...attrs(a), hex }))
    .filter((c) => c.selectable === '1')
    .sort((a, b) => Number(a.index) - Number(b.index))
    .map((c) => [Number(c.id), c.hex.toUpperCase(), Number(c.club)])
}

/* ---------- peças por categoria ---------- */
// item: [setId, gênero (M/F/U), club (0 normal, 2 HC), quantas cores aceita (0, 1 ou 2)]
const sets = {}
for (const [, typeAttrs, body] of xml.matchAll(/<settype ([^>]*)>([\s\S]*?)<\/settype>/g)) {
  const { type, paletteid } = attrs(typeAttrs)
  const items = []
  for (const [, setAttrs, parts] of body.matchAll(/<set ([^>]*)>([\s\S]*?)<\/set>/g)) {
    const s = attrs(setAttrs)
    if (s.selectable !== '1') continue
    const colorIndexes = new Set([...parts.matchAll(/colorindex="(\d+)"/g)].map((m) => m[1]).filter((i) => i !== '0'))
    const colors = s.colorable === '1' ? Math.max(1, colorIndexes.size) : 0
    items.push([Number(s.id), s.gender, Number(s.club), colors])
  }
  sets[type] = { palette: Number(paletteid), items }
}

/* ---------- nomes (roupas vendidas como mobi: customparams = ids das peças) ---------- */
const names = {}
for (const item of furni.roomitemtypes?.furnitype ?? []) {
  if (item.specialtype !== 23 || !item.customparams || !item.name) continue
  for (const id of String(item.customparams).split(',')) {
    if (/^\d+$/.test(id.trim())) names[id.trim()] ??= item.name
  }
}

if (!Object.keys(sets).length) {
  console.error('Nenhuma peça encontrada: confira se figuredata.xml foi salvo inteiro (não a página HTML).')
  process.exit(1)
}

const data = { updatedAt: new Date().toISOString(), palettes, sets, names }
await mkdir(new URL('public/data/', root), { recursive: true })
await writeFile(OUT, JSON.stringify(data))

const total = Object.values(sets).reduce((n, s) => n + s.items.length, 0)
console.log(`OK: ${total} peças, ${Object.keys(palettes).length} paletas, ${Object.keys(names).length} nomes → public/data/figure.json`)
