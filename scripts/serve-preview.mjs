import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'

const root = resolve('dist')
const port = Number(process.env.PORT || 4173)
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webm': 'video/webm',
}
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    const relative = decodeURIComponent(url.pathname).replace(/^\/agent-explainer\//, '/')
    const path = resolve(root, `.${relative.endsWith('/') ? `${relative}index.html` : relative}`)
    if (!path.startsWith(`${root}/`)) {
      res.writeHead(403)
      res.end()
      return
    }
    const body = await readFile(path)
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}).listen(port, '127.0.0.1', () =>
  console.log(`Production preview: http://127.0.0.1:${port}/agent-explainer/`),
)
