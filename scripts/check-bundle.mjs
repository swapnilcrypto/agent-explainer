import { readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
const js = readdirSync('dist/assets').filter((file) => file.endsWith('.js'))
const size = js.reduce((sum, file) => sum + gzipSync(readFileSync(`dist/assets/${file}`)).length, 0)
console.log(`All JavaScript: ${(size / 1024).toFixed(1)} KiB gzip (budget: 250 KiB)`)
if (size > 250 * 1024) process.exit(1)
