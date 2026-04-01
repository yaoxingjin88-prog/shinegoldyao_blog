<template>
  <div>
    <el-page-header @back="$router.back()" :content="isEdit ? '编辑文章' : '新增文章'" style="margin-bottom:20px" />
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label="标题" prop="title"><el-input v-model="form.title" placeholder="文章标题" /></el-form-item>
          <el-form-item label="Slug" prop="slug"><el-input v-model="form.slug" placeholder="URL路径，如 my-first-post" /></el-form-item>
          <el-form-item label="摘要"><el-input v-model="form.summary" type="textarea" :rows="3" placeholder="文章摘要" /></el-form-item>
          <el-form-item label="内容" prop="content">
            <MdEditor v-model="form.content" :style="{ width: '100%', height: '500px' }" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
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
      const article = await articleApi.list({ page: 1, pageSize: 1 })
      if (article?.list?.[0]) {
        const a = article.list.find((item: any) => String(item.id) === String(route.params.id))
        if (a) {
          Object.assign(form, { title: a.title, slug: a.slug, coverUrl: a.coverUrl, summary: a.summary, content: a.content, categoryId: a.categoryId, isTop: a.isTop, seoKeywords: a.seoKeywords, seoDescription: a.seoDescription, isPublish: a.isPublish, tagIds: a.tags?.map((t: any) => t.tag?.id).filter(Boolean) || [] })
        }
      }
    } catch { /* ignore */ }
  }
})
</script>
