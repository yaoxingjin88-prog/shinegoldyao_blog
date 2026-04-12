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
const resolvedTitle = computed(() => props.title || t('seo.defaultTitle'))
const resolvedDescription = computed(() => props.description || t('seo.defaultDescription'))
const resolvedKeywords = computed(() => props.keywords || t('seo.defaultKeywords'))
const resolvedType = computed(() => props.type || 'website')

const siteUrl = 'https://shinegoldyao.store'
const fullUrl = computed(() => props.url ? `${siteUrl}${props.url}` : siteUrl)
const ogImage = computed(() => props.image || `${siteUrl}/favicon.svg`)

useHead({
  title: resolvedTitle,
  meta: [
    { name: 'description', content: resolvedDescription },
    { name: 'keywords', content: resolvedKeywords },
    { property: 'og:title', content: resolvedTitle },
    { property: 'og:description', content: resolvedDescription },
    { property: 'og:url', content: fullUrl },
    { property: 'og:image', content: ogImage },
    { property: 'og:type', content: resolvedType },
    { name: 'twitter:title', content: resolvedTitle },
    { name: 'twitter:description', content: resolvedDescription },
    { name: 'twitter:image', content: ogImage },
  ],
  link: [
    { rel: 'canonical', href: fullUrl },
  ],
})
</script>

<template>
  <div />
</template>
