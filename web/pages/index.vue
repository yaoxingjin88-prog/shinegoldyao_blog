<template>
  <div>
    <HomeHeroSection :config="siteConfig" />
    <HomeFeaturedCarousel :banners="banners" />
    <HomeTechStackGrid :categories="skillCategories" />
    <HomeArticleSection :articles="articles" />
    <section class="py-16">
      <div class="max-w-6xl mx-auto px-6 text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">{{ $t('hero.ctaTitle') }}</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8">{{ $t('hero.ctaDesc') }}</p>
        <NuxtLink to="/contact" class="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors">
          {{ $t('hero.ctaButton') }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { getBanners, getSkillCategories, getArticles } = useApi()

const siteConfig = useSiteConfig()

const { data: homeData } = await useAsyncData('home', async () => {
  const [bannerList, skills, articleRes] = await Promise.all([
    getBanners().catch(() => []),
    getSkillCategories().catch(() => []),
    getArticles({ page: 1, pageSize: 6 }).catch(() => ({ list: [] })),
  ])
  return {
    banners: bannerList as any[],
    skillCategories: skills as any[],
    articles: ((articleRes as any)?.list || []) as any[],
  }
}, {
  server: true,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})

const banners = computed(() => homeData.value?.banners || [])
const skillCategories = computed(() => homeData.value?.skillCategories || [])
const articles = computed(() => homeData.value?.articles || [])

useHead({
  title: computed(() => '姚兴金 - ' + (siteConfig.value?.site_title || 'ShineGoldYao') + ' 个人技术博客'),
  meta: [
    { name: 'description', content: computed(() => siteConfig.value?.seo_description || '姚兴金（ShineGoldYao）的个人技术博客，专注于全栈开发、前端工程化、后端架构与开源项目分享。') },
    { name: 'keywords', content: computed(() => '姚兴金,ShineGoldYao,' + (siteConfig.value?.seo_keywords || '个人技术博客,全栈开发')) },
    { property: 'og:title', content: computed(() => '姚兴金 - ' + (siteConfig.value?.site_title || 'ShineGoldYao') + ' 个人技术博客') },
    { property: 'og:description', content: computed(() => siteConfig.value?.seo_description || '姚兴金的个人技术博客') },
    { property: 'og:url', content: 'https://shinegoldyao.store' },
  ],
  link: [
    { rel: 'canonical', href: 'https://shinegoldyao.store' },
  ],
})
</script>
