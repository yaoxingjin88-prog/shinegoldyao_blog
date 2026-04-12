<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-gray-400 mr-1">{{ $t('share.shareTo') }}</span>

    <!-- 微信 -->
    <div v-if="platforms.includes('wechat')" class="relative" ref="wechatRef">
      <button
        @click="handleWechat"
        class="share-btn bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40"
        title="分享到微信"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05a6.582 6.582 0 0 1-.261-1.828c0-3.508 3.228-6.348 7.212-6.348.244 0 .479.018.718.044C16.388 4.893 12.86 2.188 8.691 2.188zm-2.41 4.202a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24zm4.83 0a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24zM16.453 8.853c-3.502 0-6.341 2.479-6.341 5.537 0 3.06 2.84 5.538 6.341 5.538a7.63 7.63 0 0 0 2.226-.333.72.72 0 0 1 .593.08l1.501.876a.272.272 0 0 0 .138.045.242.242 0 0 0 .238-.243c0-.06-.023-.118-.039-.175l-.308-1.163a.488.488 0 0 1 .176-.551C22.625 17.49 24 15.637 24 14.39c0-3.058-2.839-5.537-6.341-5.537h-.003l-.003-.001zm-2.093 3.131a.929.929 0 1 1 0 1.858.929.929 0 0 1 0-1.858zm4.186 0a.929.929 0 1 1 0 1.858.929.929 0 0 1 0-1.858z"/>
        </svg>
      </button>
      <!-- 微信二维码弹窗 -->
      <Transition name="qr-pop">
        <div
          v-if="showWechatQR"
          class="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 p-4 rounded-2xl shadow-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 z-50"
        >
          <div class="text-center mb-3">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-200">微信扫码分享</p>
            <p class="text-xs text-gray-400 mt-0.5">打开微信扫一扫</p>
          </div>
          <div class="flex justify-center">
            <img
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`"
              alt="微信分享二维码"
              class="w-36 h-36 rounded-lg"
              loading="lazy"
            />
          </div>
          <div class="absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 rotate-45 bg-white dark:bg-gray-900 border-l border-t border-gray-200 dark:border-gray-700"></div>
        </div>
      </Transition>
    </div>

    <!-- 微博 -->
    <button
      v-if="platforms.includes('weibo')"
      @click="shareToWeibo"
      class="share-btn bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
      title="分享到微博"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.583.631.283.821.986.442 1.574zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.307-.366-.17-.603.138-.24.441-.36.684-.266.242.091.321.37.175.616zM22.063 9.432c-.062-.587-.625-1.089-1.199-.899-.029.01-.061.01-.09.022a6.783 6.783 0 0 0-.34.109c-.388.143-.787.271-1.231.271-.482 0-.96-.155-1.34-.481-.4-.34-.659-.814-.739-1.327-.035-.24-.078-.479-.118-.718-.115-.563-.392-1.082-.825-1.465-.449-.396-1.032-.59-1.638-.59-.26 0-.525.039-.781.105-.207.053-.389.179-.463.384-.078.209-.027.448.126.609.148.159.366.239.577.191a1.468 1.468 0 0 1 1.534.69c.178.3.218.68.282 1.019.045.239.09.479.135.718.142.636.56 1.183 1.107 1.545.609.402 1.33.544 2.038.422-.002.266-.025.532-.072.795-.336 1.88-1.501 3.454-3.142 4.39-1.607.914-3.5 1.199-5.334.832a8.165 8.165 0 0 1-4.441-2.709c-1.121-1.394-1.611-3.15-1.418-4.907.192-1.76 1.035-3.32 2.354-4.444 1.477-1.26 3.443-1.895 5.439-1.766a.54.54 0 0 0 .573-.473.54.54 0 0 0-.441-.609C9.653.567 7.393 1.268 5.651 2.723 3.789 4.28 2.756 6.273 2.545 8.455c-.244 2.476.476 4.863 2.019 6.71a9.357 9.357 0 0 0 5.207 3.22c2.157.42 4.415.085 6.269-1.004 1.974-1.16 3.365-3.021 3.757-5.207a7.895 7.895 0 0 0 .033-2.742h.006c.367-.005.721-.096 1.052-.236l.09-.039c.552-.263.766-.975.491-1.525h-.006.6z"/>
      </svg>
    </button>

    <!-- Twitter / X -->
    <button
      v-if="platforms.includes('twitter')"
      @click="shareToTwitter"
      class="share-btn bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      title="分享到 Twitter"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </button>

    <!-- 复制链接 -->
    <button
      v-if="platforms.includes('copy')"
      @click="copyLink"
      class="share-btn bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
      :title="copied ? $t('share.copied') : 'Copy link'"
    >
      <Check v-if="copied" class="w-4 h-4" />
      <Link2 v-else class="w-4 h-4" />
    </button>
    <Transition name="toast">
      <span v-if="copied" class="text-xs text-green-600 dark:text-green-400 font-medium">{{ $t('share.copied') }}</span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Check, Link2 } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  title: string
  url: string
  summary?: string
  platforms?: string[]
}>(), {
  platforms: () => ['wechat', 'weibo', 'twitter', 'copy'],
})

const showWechatQR = ref(false)
const copied = ref(false)
const wechatRef = ref<HTMLElement | null>(null)

const shareUrl = computed(() => props.url)
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
})

function handleWechat() {
  if (isMobile.value && navigator.share) {
    navigator.share({
      title: props.title,
      text: props.summary || props.title,
      url: props.url,
    }).catch(() => {})
  } else {
    showWechatQR.value = !showWechatQR.value
  }
}

function shareToWeibo() {
  const url = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(props.url)}&title=${encodeURIComponent(props.title)}&summary=${encodeURIComponent(props.summary || '')}`
  window.open(url, '_blank', 'width=600,height=500')
}

function shareToTwitter() {
  const text = `${props.title} ${props.url}`
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'width=600,height=500')
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const input = document.createElement('input')
    input.value = props.url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function onClickOutside(e: MouseEvent) {
  if (wechatRef.value && !wechatRef.value.contains(e.target as Node)) {
    showWechatQR.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.share-btn {
  @apply w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110;
}

.qr-pop-enter-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.qr-pop-leave-active { transition: all 0.15s ease-in; }
.qr-pop-enter-from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.95); }
.qr-pop-leave-to { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(0.98); }

.toast-enter-active { transition: all 0.2s ease-out; }
.toast-leave-active { transition: all 0.15s ease-in; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-4px); }
</style>
