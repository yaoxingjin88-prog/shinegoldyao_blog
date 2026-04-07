<template>
  <div class="min-h-screen flex items-center justify-center pt-20 pb-16 px-6 bg-gray-50 dark:bg-gray-950">
    <div class="w-full max-w-4xl flex flex-col lg:flex-row bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden border border-gray-100 dark:border-white/10">

      <!-- 左侧品牌区 -->
      <div class="lg:w-2/5 p-10 flex flex-col justify-center text-white relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 dark:bg-blue-500/20 blur-3xl"></div>
          <div class="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white/20 dark:bg-purple-500/20 blur-3xl"></div>
        </div>
        <div class="relative z-10">
          <h2 class="text-3xl font-bold mb-3">{{ siteTitle }}</h2>
          <p class="text-white/80 dark:text-gray-400 text-sm leading-relaxed mb-8">学技术 · 记笔记 · 共成长</p>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center">
                <BookOpen class="w-5 h-5" />
              </div>
              <div>
                <p class="font-medium text-sm">技术文章</p>
                <p class="text-xs text-white/60 dark:text-gray-500">深度分享前沿技术</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center">
                <MessageSquare class="w-5 h-5" />
              </div>
              <div>
                <p class="font-medium text-sm">互动社区</p>
                <p class="text-xs text-white/60 dark:text-gray-500">与开发者交流成长</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center">
                <Star class="w-5 h-5" />
              </div>
              <div>
                <p class="font-medium text-sm">收藏文章</p>
                <p class="text-xs text-white/60 dark:text-gray-500">个性化阅读体验</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录区 -->
      <div class="lg:w-3/5 p-8 md:p-10">
        <!-- Tab 切换 -->
        <div class="flex items-center gap-6 mb-8 border-b border-gray-100 dark:border-gray-800">
          <button
            v-for="tab in tabs" :key="tab.key"
            @click="activeTab = tab.key"
            class="pb-3 text-sm font-medium transition-colors relative"
            :class="activeTab === tab.key ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'"
          >
            {{ tab.label }}
            <span v-if="activeTab === tab.key" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
          </button>
        </div>

        <!-- 微信扫码登录 -->
        <div v-if="activeTab === 'wechat'" class="flex flex-col items-center">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">微信扫码登录</h3>
          <p class="text-sm text-gray-400 mb-6">使用微信扫描二维码快速登录</p>

          <!-- QR Code 占位区 -->
          <div class="w-52 h-52 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 mb-6 relative overflow-hidden">
            <QrCode class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-2" />
            <span class="text-xs text-gray-400">二维码加载中...</span>
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60 dark:to-gray-900/60 pointer-events-none"></div>
          </div>

          <div class="flex items-center gap-6 text-xs text-gray-400">
            <span class="flex items-center gap-1.5">
              <Smartphone class="w-3.5 h-3.5" /> 打开微信扫一扫
            </span>
            <span class="flex items-center gap-1.5">
              <ScanLine class="w-3.5 h-3.5" /> 扫描二维码登录
            </span>
          </div>

          <div class="mt-6 w-full p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
            <div class="flex items-start gap-2">
              <Info class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p class="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                请使用微信扫描二维码登录，未注册用户将自动创建账号
              </p>
            </div>
          </div>
        </div>

        <!-- 账号密码登录 -->
        <div v-else-if="activeTab === 'account'" class="space-y-5">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">账号登录</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">邮箱地址</label>
            <div class="relative">
              <MailIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="form.email"
                type="email"
                placeholder="your@email.com"
                class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">密码</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="请输入密码"
                class="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
              <button @click="showPwd = !showPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <EyeOff v-if="showPwd" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            @click="handleLogin"
            class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20"
          >
            登录
          </button>
          <p class="text-center text-xs text-gray-400">
            还没有账号？<button @click="activeTab = 'register'" class="text-blue-600 dark:text-blue-400 hover:underline">立即注册</button>
          </p>
        </div>

        <!-- 注册 -->
        <div v-else class="space-y-5">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">注册账号</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">昵称</label>
            <div class="relative">
              <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="form.nickname"
                type="text"
                placeholder="输入昵称"
                class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">邮箱地址</label>
            <div class="relative">
              <MailIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="form.email"
                type="email"
                placeholder="your@email.com"
                class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">密码</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="至少6位密码"
                class="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
              <button @click="showPwd = !showPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <EyeOff v-if="showPwd" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            @click="handleRegister"
            class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20"
          >
            注册
          </button>
          <p class="text-center text-xs text-gray-400">
            已有账号？<button @click="activeTab = 'account'" class="text-blue-600 dark:text-blue-400 hover:underline">返回登录</button>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BookOpen, MessageSquare, Star, QrCode, Smartphone, ScanLine, Info,
  Mail as MailIcon, Lock, Eye, EyeOff, User
} from 'lucide-vue-next'

const { getSiteConfig } = useApi()
const { data: loginConfig } = await useAsyncData('login-config', () => getSiteConfig().catch(() => ({})))
const siteTitle = computed(() => (loginConfig.value as any)?.site_title || 'DevVoyage')

const tabs = [
  { key: 'wechat', label: '微信登录' },
  { key: 'account', label: '账号登录' },
]
const activeTab = ref('wechat')
const showPwd = ref(false)
const form = reactive({
  email: '',
  password: '',
  nickname: '',
})

function handleLogin() {
  // TODO: 对接后端登录 API
  alert('登录功能开发中，请等待微信 API 对接完成')
}

function handleRegister() {
  // TODO: 对接后端注册 API
  alert('注册功能开发中')
}

useHead({ title: '登录 - ' + siteTitle.value })
</script>
