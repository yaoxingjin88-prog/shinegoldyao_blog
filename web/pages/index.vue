<template>
  <div>
    <HomeHeroSection :config="siteConfig" />
    <HomeFeaturedCarousel :banners="banners" />
    <HomeTechStackGrid :categories="skillCategories" />
    <HomeArticleSection :articles="articles" />
    <section class="py-16">
      <div class="max-w-6xl mx-auto px-6 text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">开始交流</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8">有任何想法或合作意向？欢迎随时联系我</p>
        <NuxtLink to="/contact" class="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors">
          联系我
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { getSiteConfig, getBanners, getSkillCategories, getArticles } = useApi()

const { data: homeData } = await useAsyncData('home', async () => {
  const [config, bannerList, skills, articleRes] = await Promise.all([
    getSiteConfig().catch(() => ({})),
    getBanners().catch(() => []),
    getSkillCategories().catch(() => []),
    getArticles({ page: 1, pageSize: 6 }).catch(() => ({ list: [] })),
  ])
  return {
    siteConfig: config as Record<string, string>,
    banners: bannerList as any[],
    skillCategories: skills as any[],
    articles: ((articleRes as any)?.list || []) as any[],
  }
}, {
  server: true,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})

const siteConfig = computed(() => homeData.value?.siteConfig || {})
const banners = computed(() => homeData.value?.banners || [])
const skillCategories = computed(() => homeData.value?.skillCategories || [])
const articles = computed(() => homeData.value?.articles || [])

useHead({
  title: computed(() => (siteConfig.value?.site_title || 'DevVoyage') + ' - 个人技术博客'),
  meta: [
    { name: 'description', content: computed(() => siteConfig.value?.seo_description || '') },
    { name: 'keywords', content: computed(() => siteConfig.value?.seo_keywords || '') },
  ],
})
</script>
