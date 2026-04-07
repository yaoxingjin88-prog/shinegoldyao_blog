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
            <template v-for="s in socials" :key="s.id">
              <a v-if="s.linkUrl && /^https?:\/\//.test(s.linkUrl)" :href="s.linkUrl" target="_blank" class="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" :title="s.platformName">
                <img v-if="s.iconUrl" :src="s.iconUrl" :alt="s.platformName" class="w-5 h-5" />
                <component v-else-if="getSocialIcon(s.platformName)" :is="getSocialIcon(s.platformName)" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span v-else class="text-xs">{{ s.platformName }}</span>
              </a>
              <NuxtLink v-else to="/contact" class="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" :title="s.platformName">
                <img v-if="s.iconUrl" :src="s.iconUrl" :alt="s.platformName" class="w-5 h-5" />
                <component v-else-if="getSocialIcon(s.platformName)" :is="getSocialIcon(s.platformName)" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span v-else class="text-xs">{{ s.platformName }}</span>
              </NuxtLink>
            </template>
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
import { Github, Mail, MessageCircle, Twitter, Linkedin, Globe, Youtube, Instagram, Facebook, Rss } from 'lucide-vue-next'

const iconMap: Record<string, any> = {
  github: Github, GitHub: Github,
  邮箱: Mail, email: Mail, Email: Mail, mail: Mail,
  微信: MessageCircle, wechat: MessageCircle, WeChat: MessageCircle,
  twitter: Twitter, Twitter: Twitter, X: Twitter,
  linkedin: Linkedin, LinkedIn: Linkedin,
  youtube: Youtube, YouTube: Youtube,
  instagram: Instagram, Instagram: Instagram,
  facebook: Facebook, Facebook: Facebook,
  rss: Rss, RSS: Rss,
  博客: Globe, blog: Globe, 网站: Globe, website: Globe,
}

function getSocialIcon(name: string): any {
  if (!name) return undefined
  if (iconMap[name]) return iconMap[name]
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lower.includes(key.toLowerCase())) return icon
  }
  return Globe
}

const { getSocialLinks } = useApi()
const links = [
  { to: '/', label: '首页' },
  { to: '/about', label: '关于我' },
  { to: '/articles', label: '文章' },
  { to: '/projects', label: '项目' },
  { to: '/contact', label: '联系' },
]

const { data: socials } = await useAsyncData('footer-socials', () => getSocialLinks().catch(() => []))
const siteTitle = 'ShiGoldYao'
const siteSubtitle = '一个专注于现代前端架构、系统底层原理与极客生活方式的个人技术博客。在这里，架构代码，书写未来。'
</script>
