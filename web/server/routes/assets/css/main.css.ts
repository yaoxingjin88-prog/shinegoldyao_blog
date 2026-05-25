import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'text/css; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')
  return await readFile(join(process.cwd(), 'assets/css/main.css'), 'utf8')
})
