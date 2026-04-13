export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n as any
  if (!i18n) return
  const langMap: Record<string, string> = { zh: 'zh-CN', en: 'en' }

  useHead({
    htmlAttrs: { lang: computed(() => langMap[i18n.locale.value] || i18n.locale.value) },
  })
})
