<template>
  <div>
    <h3 style="margin-bottom:20px">网站配置</h3>
    <el-form label-width="120px" style="max-width:600px">
      <el-form-item v-for="(value, key) in configs" :key="key" :label="configLabels[key] || key">
        <el-input v-if="textareaKeys.includes(key)" v-model="configs[key]" type="textarea" :rows="3" />
        <el-input v-else v-model="configs[key]" />
      </el-form-item>
      <el-form-item><el-button type="primary" :loading="loading" @click="handleSave">保存配置</el-button></el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { siteApi } from '../../api'

const configs = reactive<Record<string, string>>({})
const loading = ref(false)
const configLabels: Record<string, string> = {
  site_title: '网站标题', site_subtitle: '网站副标题', site_subtitle_highlight: '副标题高亮',
  home_intro: '首页简介标签', home_description: '首页个人描述',
  about_name: '关于我 - 名字', about_intro: '关于我 - 简介',
  avatar: '个人头像URL', seo_keywords: 'SEO关键词', seo_description: 'SEO描述',
}
const textareaKeys = ['seo_description', 'home_intro', 'home_description', 'about_intro']

async function handleSave() {
  loading.value = true
  try {
    const list = Object.entries(configs).map(([key, value]) => ({ key, value }))
    await siteApi.updateConfig(list)
    ElMessage.success('保存成功')
  } finally { loading.value = false }
}

const defaultKeys = Object.keys(configLabels)

onMounted(async () => {
  const data = await siteApi.getConfig()
  defaultKeys.forEach(k => { configs[k] = data?.[k] || '' })
})
</script>
