<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}>(), {
  title: '姚兴金 - ShineGoldYao 个人技术博客',
  description: '姚兴金（ShineGoldYao）的个人技术博客，专注于全栈开发、前端工程化、后端架构与开源项目分享。',
  keywords: '姚兴金,ShineGoldYao,个人技术博客,全栈开发',
  image: '',
  url: '',
  type: 'website',
})

const siteUrl = 'https://shinegoldyao.store'
const fullUrl = computed(() => props.url ? `${siteUrl}${props.url}` : siteUrl)
const ogImage = computed(() => props.image || `${siteUrl}/favicon.svg`)

useHead({
  title: props.title,
  meta: [
    { name: 'description', content: props.description },
    { name: 'keywords', content: props.keywords },
    { property: 'og:title', content: props.title },
    { property: 'og:description', content: props.description },
    { property: 'og:url', content: fullUrl.value },
    { property: 'og:image', content: ogImage.value },
    { property: 'og:type', content: props.type },
    { name: 'twitter:title', content: props.title },
    { name: 'twitter:description', content: props.description },
    { name: 'twitter:image', content: ogImage.value },
  ],
  link: [
    { rel: 'canonical', href: fullUrl.value },
  ],
})
</script>

<template>
  <div />
</template>
