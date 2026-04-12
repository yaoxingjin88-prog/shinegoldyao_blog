export default defineNuxtPlugin(() => {
  const { locale } = useI18n()
  const langMap: Record<string, string> = { zh: 'zh-CN', en: 'en' }

  useHead({
    htmlAttrs: { lang: computed(() => langMap[locale.value] || locale.value) },
  })
})
