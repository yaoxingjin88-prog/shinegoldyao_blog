<template>
  <footer class="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-12">
    <div class="max-w-6xl mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 class="text-lg font-bold gradient-text mb-3">{{ siteTitle }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ siteSubtitle }}</p>
        </div>
        <div>
          <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">快速链接</h4>
          <div class="space-y-2">
            <NuxtLink v-for="item in links" :key="item.to" :to="item.to" class="block text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{{ item.label }}</NuxtLink>
          </div>
        </div>
        <div>
          <h4 class="font-semibold mb-3 text-gray-900 dark:text-white">社交媒体</h4>
          <div class="flex gap-3">
            <a v-for="s in socials" :key="s.id" :href="s.linkUrl" target="_blank" class="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <img v-if="s.iconUrl" :src="s.iconUrl" :alt="s.platformName" class="w-5 h-5" />
              <span v-else class="text-xs">{{ s.platformName }}</span>
            </a>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-200 dark:border-gray-800 pt-6 text-center text-sm text-gray-400">
        &copy; {{ new Date().getFullYear() }} {{ siteTitle }}. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { getSocialLinks, getSiteConfig } = useApi()
const socials = ref<any[]>([])
const siteTitle = ref('')
const siteSubtitle = ref('架构代码，书写未来')
const links = [
  { to: '/', label: '首页' },
  { to: '/about', label: '关于我' },
  { to: '/articles', label: '文章' },
  { to: '/projects', label: '项目' },
  { to: '/contact', label: '联系' },
]

onMounted(async () => {
  try { socials.value = await getSocialLinks() } catch {}
  try {
    const config = await getSiteConfig()
    if (config?.site_title) siteTitle.value = config.site_title
    if (config?.site_subtitle) siteSubtitle.value = config.site_subtitle
  } catch {}
})
</script>
