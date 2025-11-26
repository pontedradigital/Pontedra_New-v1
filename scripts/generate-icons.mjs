import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

async function genPngFromSvg(svgPath, outPath, size) {
  const buf = await fs.readFile(svgPath)
  const png = await sharp(buf).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
  await fs.writeFile(outPath, png)
}

async function genIcoFromSvg(svgPath, outPath, size) {
  const tmpPng = path.join(path.dirname(outPath), `tmp-${size}.png`)
  await genPngFromSvg(svgPath, tmpPng, size)
  const ico = await pngToIco([tmpPng])
  await fs.writeFile(outPath, ico)
  await fs.rm(tmpPng)
}

async function main() {
  const svg = path.resolve('public', 'pontedra-logo.svg')
  const faviconsDir = path.resolve('public', 'favicons')
  const iosDir = path.resolve('public', 'ios')
  const androidDir = path.resolve('public', 'android')
  const windowsDir = path.resolve('public', 'windows')

  await ensureDir(faviconsDir)
  await ensureDir(iosDir)
  await ensureDir(androidDir)
  await ensureDir(windowsDir)

  await genIcoFromSvg(svg, path.join(faviconsDir, 'favicon-16.ico'), 16)
  await genIcoFromSvg(svg, path.join(faviconsDir, 'favicon-32.ico'), 32)
  await genIcoFromSvg(svg, path.join(faviconsDir, 'favicon-48.ico'), 48)
  // multi-size favicon.ico at public root
  const tmpDir = path.resolve('public', '.tmp-icons')
  await ensureDir(tmpDir)
  const sizes = [16, 32, 48, 64]
  const pngs = []
  for (const s of sizes) {
    const p = path.join(tmpDir, `favicon-${s}.png`)
    await genPngFromSvg(svg, p, s)
    pngs.push(p)
  }
  const multiIco = await pngToIco(pngs)
  await fs.writeFile(path.resolve('public', 'favicon.ico'), multiIco)
  // cleanup
  for (const p of pngs) await fs.rm(p)
  await fs.rm(tmpDir, { recursive: true, force: true })

  await genPngFromSvg(svg, path.join(iosDir, 'apple-touch-icon-60x60.png'), 60)
  await genPngFromSvg(svg, path.join(iosDir, 'apple-touch-icon-76x76.png'), 76)
  await genPngFromSvg(svg, path.join(iosDir, 'apple-touch-icon-120x120.png'), 120)
  await genPngFromSvg(svg, path.join(iosDir, 'apple-touch-icon-152x152.png'), 152)
  await genPngFromSvg(svg, path.join(iosDir, 'apple-touch-icon-180x180.png'), 180)

  await genPngFromSvg(svg, path.join(androidDir, 'android-chrome-192x192.png'), 192)
  await genPngFromSvg(svg, path.join(androidDir, 'android-chrome-512x512.png'), 512)

  await genPngFromSvg(svg, path.join(windowsDir, 'mstile-144x144.png'), 144)

  console.log('Icon generation completed.')
}

main().catch((e) => { console.error(e); process.exit(1) })
