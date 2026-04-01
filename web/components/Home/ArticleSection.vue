<template>
  <section v-if="articles.length" class="py-20">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="section-title">最新文章</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </div>
      <div class="text-center mt-10">
        <NuxtLink to="/articles" class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 hover:border-blue-400 rounded-full font-medium transition-colors">
          查看全部文章
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
