import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

async function genPng(srcPath, outPath, size) {
  const buf = await fs.readFile(srcPath)
  const png = await sharp(buf)
    .resize(size.width ?? size, size.height ?? size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer()
  await fs.writeFile(outPath, png)
}

async function genIco(srcPath, outPath, sizes) {
  const tmpDir = path.join(path.dirname(outPath), '.tmp-ico')
  await ensureDir(tmpDir)
  const pngs = []
  for (const s of sizes) {
    const p = path.join(tmpDir, `ico-${s}.png`)
    await genPng(srcPath, p, s)
    pngs.push(p)
  }
  const ico = await pngToIco(pngs)
  await fs.writeFile(outPath, ico)
  for (const p of pngs) await fs.rm(p)
  await fs.rm(tmpDir, { recursive: true, force: true })
}

async function resolveSource() {
  const candidates = [
    path.resolve('public', 'pontedra-logo.webp'),
    path.resolve('public', 'pontedra-logo.png'),
    path.resolve('public', 'pontedra-logo.svg'),
  ]
  for (const c of candidates) {
    try { await fs.access(c); return c } catch {}
  }
  throw new Error('Logo source not found in /public (pontedra-logo.*)')
}

async function main() {
  const src = await resolveSource()
  const faviconsDir = path.resolve('public', 'favicons')
  const iosDir = path.resolve('public', 'ios')
  const androidDir = path.resolve('public', 'android')
  const windowsDir = path.resolve('public', 'windows')

  await ensureDir(faviconsDir)
  await ensureDir(iosDir)
  await ensureDir(androidDir)
  await ensureDir(windowsDir)

  await genIco(src, path.join(faviconsDir, 'favicon-16.ico'), [16])
  await genIco(src, path.join(faviconsDir, 'favicon-32.ico'), [32])
  await genIco(src, path.join(faviconsDir, 'favicon-48.ico'), [48])
  await genIco(src, path.resolve('public', 'favicon.ico'), [16, 32, 48, 64])

  const appleSizes = [57,60,72,76,114,120,144,152,180]
  for (const s of appleSizes) {
    await genPng(src, path.join(iosDir, `apple-touch-icon-${s}x${s}.png`), s)
  }

  await genPng(src, path.join(androidDir, 'android-chrome-192x192.png'), 192)
  await genPng(src, path.join(androidDir, 'android-chrome-512x512.png'), 512)

  await genPng(src, path.join(windowsDir, 'mstile-70x70.png'), 70)
  await genPng(src, path.join(windowsDir, 'mstile-150x150.png'), 150)
  await genPng(src, path.join(windowsDir, 'mstile-310x310.png'), 310)
  await genPng(src, path.join(windowsDir, 'mstile-310x150.png'), { width: 310, height: 150 })

  console.log('Icon generation completed.')
}

main().catch((e) => { console.error(e); process.exit(1) })
