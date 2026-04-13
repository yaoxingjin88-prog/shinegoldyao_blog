<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}>()

const { t } = useI18n()
const siteUrl = 'https://shinegoldyao.store'

useHead(() => {
  const title = props.title || t('seo.defaultTitle')
  const description = props.description || t('seo.defaultDescription')
  const keywords = props.keywords || t('seo.defaultKeywords')
  const type = props.type || 'website'
  const url = props.url ? `${siteUrl}${props.url}` : siteUrl
  const image = props.image || `${siteUrl}/favicon.svg`

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:type', content: type },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    link: [
      { rel: 'canonical', href: url },
    ],
  }
})
</script>

<template>
  <div />
</template>
