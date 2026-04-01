<template>
  <section v-if="categories.length" class="py-20 bg-gray-50 dark:bg-gray-900/50">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="section-title">技术栈</h2>
      <div v-for="cat in categories" :key="cat.id" class="mb-10">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" :style="{ background: cat.themeColor || '#3b82f6' }"></span>
          {{ cat.categoryName }}
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div v-for="skill in cat.skills" :key="skill.id" class="glass-card p-4 text-center hover-lift cursor-default">
            <img v-if="skill.iconUrl" :src="skill.iconUrl" :alt="skill.skillName" class="w-10 h-10 mx-auto mb-2 object-contain" />
            <div v-else class="w-10 h-10 mx-auto mb-2 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold">{{ skill.skillName?.charAt(0) }}</div>
            <p class="text-sm font-medium mb-1">{{ skill.skillName }}</p>
            <p v-if="skill.description" class="text-xs text-gray-400 dark:text-gray-500 mb-2 line-clamp-2">{{ skill.description }}</p>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div class="h-1.5 rounded-full transition-all duration-700" :style="{ width: skill.proficiency + '%', background: cat.themeColor || '#3b82f6' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ categories: any[] }>()
</script>
