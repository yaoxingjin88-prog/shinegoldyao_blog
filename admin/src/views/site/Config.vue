<template>
  <div>
    <h3 style="margin-bottom:20px">网站配置</h3>
    <el-form label-width="130px" label-position="top" style="max-width:900px">
      <el-form-item v-for="(value, key) in configs" :key="key" :label="configLabels[key] || key">
        <template v-if="key === 'share_platforms'">
          <el-checkbox-group v-model="sharePlatforms" @change="onShareChange">
            <el-checkbox label="wechat">微信</el-checkbox>
            <el-checkbox label="weibo">微博</el-checkbox>
            <el-checkbox label="twitter">Twitter</el-checkbox>
            <el-checkbox label="copy">复制链接</el-checkbox>
          </el-checkbox-group>
          <div style="font-size:12px;color:#999;margin-top:4px">勾选后前台文章页将显示对应的分享按钮</div>
        </template>
        <el-input v-else-if="textareaKeys.includes(key)" v-model="configs[key]" type="textarea" :rows="3" />
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
  code_skills: '代码展示 - 技能列表', code_goal: '代码展示 - 目标', code_log: '代码展示 - 日志',
  code_comment_1: '代码展示 - 注释1', code_comment_2: '代码展示 - 注释2',
  share_platforms: '文章分享渠道',
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

const sharePlatforms = ref<string[]>([])

function onShareChange(val: string[]) {
  configs['share_platforms'] = val.join(',')
}

const defaultKeys = Object.keys(configLabels)

onMounted(async () => {
  const data = await siteApi.getConfig()
  defaultKeys.forEach(k => { configs[k] = data?.[k] || '' })
  if (configs['share_platforms']) {
    sharePlatforms.value = configs['share_platforms'].split(',').filter(Boolean)
  } else {
    sharePlatforms.value = ['wechat', 'weibo', 'twitter', 'copy']
    configs['share_platforms'] = 'wechat,weibo,twitter,copy'
  }
})
</script>
