<template>
  <div class="pt-24 pb-16">
    <div class="max-w-2xl mx-auto px-6">
      <h1 class="text-4xl font-bold mb-4">联系我</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-10">有任何想法、问题或合作意向，欢迎给我留言</p>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium mb-2">昵称 <span class="text-red-500">*</span></label>
            <input v-model="form.nickname" type="text" required maxlength="50" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="你的昵称" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">邮箱 <span class="text-red-500">*</span></label>
            <input v-model="form.email" type="email" required class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="your@email.com" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">联系方式（可选）</label>
          <input v-model="form.contact" type="text" maxlength="100" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="微信 / QQ / 其他" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">留言内容 <span class="text-red-500">*</span></label>
          <textarea v-model="form.content" required maxlength="1000" rows="6" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none" placeholder="写下你想说的..."></textarea>
          <p class="text-xs text-gray-400 mt-1 text-right">{{ form.content.length }} / 1000</p>
        </div>
        <button type="submit" :disabled="loading" class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
          <Send class="w-4 h-4" />
          {{ loading ? '提交中...' : '提交留言' }}
        </button>
        <p v-if="success" class="text-center text-green-600 dark:text-green-400 text-sm">留言提交成功，感谢你的反馈！</p>
        <p v-if="error" class="text-center text-red-500 text-sm">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Send } from 'lucide-vue-next'

const { submitMessage } = useApi()
const loading = ref(false)
const success = ref(false)
const error = ref('')
const form = reactive({ nickname: '', email: '', content: '', contact: '' })

async function handleSubmit() {
  loading.value = true
  success.value = false
  error.value = ''
  try {
    await submitMessage(form)
    success.value = true
    Object.assign(form, { nickname: '', email: '', content: '', contact: '' })
  } catch (e: any) {
    error.value = e?.message || '提交失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

useHead({ title: '联系我 - DevVoyage' })
</script>
