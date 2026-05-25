export default defineNuxtPlugin(() => {
  if (!import.meta.dev || !('serviceWorker' in navigator)) return

  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister())
  })

  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys
        .filter((key) => key.includes('workbox') || key.includes('static-assets') || key.includes('precache'))
        .forEach((key) => caches.delete(key))
    })
  }
})
