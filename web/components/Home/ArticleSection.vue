<template>
  <section v-if="articles.length" class="py-12 md:py-16">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('hero.articleSectionTitle') }}</h2>
          <p class="text-gray-500 dark:text-gray-400">{{ $t('hero.articleSectionDesc') }}</p>
        </div>
        <NuxtLink to="/articles" class="hidden md:inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors group">
          {{ $t('hero.viewAll') }}
          <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </div>
      <div class="text-center mt-8 md:hidden">
        <NuxtLink to="/articles" class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 hover:border-blue-400 rounded-full font-medium transition-colors">
          {{ $t('hero.viewAllArticles') }}
          <ArrowRight class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
defineProps<{ articles: any[] }>()
</script>
