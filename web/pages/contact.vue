<template>
  <div class="pt-24 pb-16">
    <div class="max-w-6xl mx-auto px-6">
      <section class="min-h-[70vh] flex flex-col md:flex-row items-center justify-between gap-16">

        <!-- 左侧：文字信息 + 联系方式 -->
        <div class="w-full md:w-1/2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-sm mb-6">
            <Sparkles class="w-4 h-4" />
            {{ $t('contact.badge') }}
          </div>
          <h1 class="text-5xl font-extrabold tracking-tight mb-6">
            {{ $t('contact.title') }} <span class="gradient-text">{{ $t('contact.titleHighlight') }}</span>
          </h1>
          <p class="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed">
            {{ $t('contact.subtitle') }}
          </p>

          <div class="space-y-6">
            <div v-for="item in contactItems" :key="item.id" class="flex items-center gap-4 group">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm" :class="item.bgClass">
                <component :is="item.icon" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.platformName }}</p>
                <a v-if="item.isLink" :href="item.linkUrl" target="_blank" class="text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{{ item.displayValue }}</a>
                <p v-else class="text-gray-900 dark:text-white font-medium">{{ item.displayValue }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：留言表单 -->
        <div class="w-full md:w-1/2">
          <div class="glass-card p-8">
            <form class="space-y-5" @submit.prevent="handleSubmit">
              <div class="space-y-2">
                <label class="text-sm font-medium">{{ $t('contact.nameLabel') }}</label>
                <input v-model="form.nickname" type="text" required maxlength="50" :placeholder="$t('contact.namePlaceholder')" class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">{{ $t('contact.emailLabel') }}</label>
                <input v-model="form.email" type="email" required :placeholder="$t('contact.emailPlaceholder')" class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">{{ $t('contact.contentLabel') }}</label>
                <textarea v-model="form.content" required maxlength="1000" rows="4" :placeholder="$t('contact.contentPlaceholder')" class="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all resize-none"></textarea>
              </div>
              <button type="submit" :disabled="loading" class="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold tracking-wide hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
                {{ loading ? $t('contact.sending') : $t('contact.send') }}
              </button>
              <p v-if="success" class="text-center text-green-600 dark:text-green-400 text-sm">{{ $t('contact.success') }}</p>
              <p v-if="error" class="text-center text-red-500 text-sm">{{ error }}</p>
            </form>
          </div>
        </div>

      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, Mail, Github, MessageCircle, Globe, Twitter, Linkedin } from 'lucide-vue-next'

const { t } = useI18n()
const { submitMessage, getSocialLinks } = useApi()
const loading = ref(false)
const success = ref(false)
const error = ref('')
const form = reactive({ nickname: '', email: '', content: '', contact: '' })

const { data: socials } = await useAsyncData('contact-socials', () => getSocialLinks().catch(() => []), {
  lazy: true,
  getCachedData: (key: any, nuxtApp: any) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})

const iconMap: Record<string, any> = {
  '邮箱': Mail, 'email': Mail, 'Email': Mail,
  'github': Github, 'GitHub': Github,
  '微信': MessageCircle, 'WeChat': MessageCircle, 'wechat': MessageCircle,
  'Twitter': Twitter, 'twitter': Twitter, 'X': Twitter,
  'LinkedIn': Linkedin, 'linkedin': Linkedin,
}
const bgMap: Record<string, string> = {
  '邮箱': 'bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400',
  'email': 'bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400',
  'Email': 'bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400',
  'github': 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300',
  'GitHub': 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300',
  '微信': 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
  'WeChat': 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
  'wechat': 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
}
const defaultBg = 'bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400'

const contactItems = computed(() =>
  (socials.value || []).map((s: any) => {
    const isLink = /^https?:\/\//.test(s.linkUrl || '')
    return {
      ...s,
      icon: iconMap[s.platformName] || Globe,
      bgClass: bgMap[s.platformName] || defaultBg,
      isLink,
      displayValue: isLink ? s.linkUrl.replace(/^https?:\/\//, '') : (s.linkUrl || s.platformName),
    }
  })
)

async function handleSubmit() {
  loading.value = true
  success.value = false
  error.value = ''
  try {
    await submitMessage(form)
    success.value = true
    Object.assign(form, { nickname: '', email: '', content: '', contact: '' })
  } catch (e: any) {
    error.value = e?.message || t('contact.error')
  } finally {
    loading.value = false
  }
}

useHead({
  title: '联系姚兴金 - ShineGoldYao',
  meta: [
    { name: 'description', content: '联系姚兴金（ShineGoldYao），欢迎技术交流、合作洽谈或提出建议。' },
    { name: 'keywords', content: '姚兴金,联系方式,技术交流,合作,ShineGoldYao' },
    { property: 'og:title', content: '联系姚兴金 - ShineGoldYao' },
    { property: 'og:url', content: 'https://shinegoldyao.store/contact' },
  ],
  link: [{ rel: 'canonical', href: 'https://shinegoldyao.store/contact' }],
})
</script>
