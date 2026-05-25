export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/javascript; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')
  return `self.addEventListener('install', event => self.skipWaiting())
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.map(key => caches.delete(key)))
    await self.registration.unregister()
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    clientsList.forEach(client => client.navigate(client.url))
  })())
})`
})
