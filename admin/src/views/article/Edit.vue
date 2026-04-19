<template>
  <div>
    <el-page-header @back="$router.back()" :content="isEdit ? '编辑文章' : '新增文章'" style="margin-bottom:20px" />
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label="标题" prop="title"><el-input v-model="form.title" placeholder="文章标题" /></el-form-item>
          <el-form-item label="Slug" prop="slug"><el-input v-model="form.slug" placeholder="URL路径，如 my-first-post" /></el-form-item>
          <el-form-item label="摘要">
            <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="文章摘要（留空点击下方 AI 生成可自动填充）" />
          </el-form-item>
          <el-form-item label="AI 助手">
            <el-space wrap>
              <el-button type="success" :loading="aiLoading" :disabled="!form.title || !form.content" @click="handleAiGenerate">
                <el-icon style="margin-right:4px"><MagicStick /></el-icon>
                AI 生成 摘要 / SEO / 标签
              </el-button>
              <el-tooltip content="基于标题和正文，调用大模型自动生成 TL;DR 摘要、SEO 关键词与推荐标签" placement="top">
                <el-icon style="color:#909399;cursor:help"><InfoFilled /></el-icon>
              </el-tooltip>
            </el-space>
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <MdEditor v-if="editorVisible" v-model="form.content" :style="{ width: '100%', height: '500px' }" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never">
            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="选择分类" style="width:100%">
                <el-option v-for="c in categories" :key="c.id" :label="c.categoryName" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="标签">
              <el-select v-model="form.tagIds" multiple placeholder="选择标签" style="width:100%">
                <el-option v-for="t in tags" :key="t.id" :label="t.tagName" :value="t.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="封面"><el-input v-model="form.coverUrl" placeholder="封面图URL" /></el-form-item>
            <el-form-item label="置顶"><el-switch v-model="form.isTop" :active-value="1" :inactive-value="0" /></el-form-item>
            <el-form-item label="SEO关键词"><el-input v-model="form.seoKeywords" placeholder="逗号分隔" /></el-form-item>
            <el-form-item label="SEO描述"><el-input v-model="form.seoDescription" type="textarea" :rows="2" /></el-form-item>
            <el-form-item>
              <el-space>
                <el-button type="primary" :loading="loading" @click="handleSubmit(1)">发布</el-button>
                <el-button :loading="loading" @click="handleSubmit(0)">存为草稿</el-button>
              </el-space>
            </el-form-item>
          </el-card>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { MagicStick, InfoFilled } from '@element-plus/icons-vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { articleApi, categoryApi, tagApi } from '../../api'
import type { ArticleCategory, ArticleTag } from '../../types'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const categories = ref<ArticleCategory[]>([])
const tags = ref<ArticleTag[]>([])
const isEdit = computed(() => !!route.params.id)
const editorVisible = ref(false)
const aiLoading = ref(false)

const form = reactive({
  title: '', slug: '', coverUrl: '', summary: '', content: '',
  categoryId: undefined as string | undefined, tagIds: [] as string[],
  isTop: 0, seoKeywords: '', seoDescription: '', isPublish: 0,
})

const rules = {
  title: [{ required: true, message: '请输入标题' }],
  slug: [{ required: true, message: '请输入Slug' }],
  content: [{ required: true, message: '请输入内容' }],
  categoryId: [{ required: true, message: '请选择分类' }],
}

async function handleAiGenerate() {
  if (!form.title?.trim() || !form.content?.trim()) {
    ElMessage.warning('请先填写标题和正文')
    return
  }
  aiLoading.value = true
  try {
    const res = await articleApi.aiGenerate({ title: form.title, content: form.content })
    if (!res || (!res.summary && !res.keywords?.length && !res.tags?.length)) {
      ElMessage.warning('AI 生成失败或返回为空，请检查服务端 DASHSCOPE_API_KEY 配置')
      return
    }
    const fields: string[] = []
    if (res.summary) fields.push(`摘要：${res.summary}`)
    if (res.seoDescription) fields.push(`SEO 描述：${res.seoDescription}`)
    if (res.keywords?.length) fields.push(`关键词：${res.keywords.join('、')}`)
    if (res.tags?.length) fields.push(`推荐标签：${res.tags.join('、')}`)
    await ElMessageBox.confirm(
      fields.join('\n\n'),
      'AI 生成结果预览（确认后将覆盖空字段）',
      {
        confirmButtonText: '应用到表单',
        cancelButtonText: '取消',
        type: 'info',
        customStyle: { whiteSpace: 'pre-wrap' } as any,
      },
    )
    if (!form.summary?.trim() && res.summary) form.summary = res.summary
    if (!form.seoDescription?.trim() && res.seoDescription) form.seoDescription = res.seoDescription
    if (!form.seoKeywords?.trim() && res.keywords?.length) form.seoKeywords = res.keywords.join(',')
    if (res.matchedTagIds?.length) {
      const merged = new Set([...form.tagIds, ...res.matchedTagIds])
      form.tagIds = Array.from(merged)
    }
    ElMessage.success('已应用 AI 生成结果')
  } catch (err: any) {
    if (err !== 'cancel') ElMessage.error('AI 生成失败')
  } finally {
    aiLoading.value = false
  }
}

async function handleSubmit(isPublish: number) {
  await formRef.value?.validate()
  loading.value = true
  try {
    const data = { ...form, isPublish, tagIds: form.tagIds.map(Number) }
    if (isEdit.value) {
      await articleApi.update(route.params.id as string, data)
      ElMessage.success('更新成功')
    } else {
      await articleApi.create(data)
      ElMessage.success('创建成功')
    }
    router.push('/article')
  } finally { loading.value = false }
}

onMounted(async () => {
  const [cats, tgs] = await Promise.all([categoryApi.list(), tagApi.list()])
  categories.value = cats || []
  tags.value = tgs || []
  if (isEdit.value) {
    try {
      const a = await articleApi.getById(route.params.id as string)
      if (a) {
        Object.assign(form, { title: a.title, slug: a.slug, coverUrl: a.coverUrl, summary: a.summary, content: a.content, categoryId: a.categoryId ? String(a.categoryId) : undefined, isTop: a.isTop, seoKeywords: a.seoKeywords || '', seoDescription: a.seoDescription || '', isPublish: a.isPublish, tagIds: a.tags?.map((t: any) => String(t.tag?.id)).filter(Boolean) || [] })
      }
    } catch { /* ignore */ }
  }
  // 从Gitee导入的数据
  if (route.query.from === 'gitee') {
    const raw = sessionStorage.getItem('gitee_import')
    if (raw) {
      try {
        const imported = JSON.parse(raw)
        form.title = imported.title || ''
        form.slug = imported.slug || ''
        form.content = imported.content || ''
      } catch { /* ignore */ }
      sessionStorage.removeItem('gitee_import')
    }
  }
  // 延迟显示编辑器，避免路由切换时的DOM错误
  editorVisible.value = true
})

onBeforeUnmount(() => {
  // 隐藏编辑器，避免组件卸载时的DOM错误
  editorVisible.value = false
})
</script>
