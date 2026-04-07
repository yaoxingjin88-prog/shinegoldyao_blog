<template>
  <div>
    <el-page-header @back="$router.back()" :content="isEdit ? '编辑项目' : '新增项目'" style="margin-bottom:20px" />
    <el-form :model="form" label-width="100px" style="max-width:700px">
      <el-form-item label="项目名称"><el-input v-model="form.projectName" /></el-form-item>
      <el-form-item label="项目类型">
        <el-radio-group v-model="form.type">
          <el-radio :value="0">我的项目</el-radio>
          <el-radio :value="1">推荐项目</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="简介"><el-input v-model="form.shortDesc" type="textarea" :rows="2" /></el-form-item>
      <el-form-item label="详细描述"><el-input v-model="form.fullDesc" type="textarea" :rows="4" /></el-form-item>
      <el-form-item label="技术栈">
        <el-select v-model="form.techStack" multiple allow-create filterable placeholder="输入后回车添加" style="width:100%" />
      </el-form-item>
      <el-form-item label="封面URL"><el-input v-model="form.coverUrl" /></el-form-item>
      <el-form-item label="Demo地址"><el-input v-model="form.demoUrl" /></el-form-item>
      <el-form-item label="GitHub"><el-input v-model="form.githubUrl" /></el-form-item>
      <el-form-item label="Gitee"><el-input v-model="form.giteeUrl" /></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
      <el-form-item label="显示"><el-switch v-model="form.isShow" :active-value="1" :inactive-value="0" /></el-form-item>
      <el-form-item><el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button></el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { projectApi } from '../../api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const isEdit = computed(() => !!route.params.id)
const form = reactive({ projectName: '', type: 0, shortDesc: '', fullDesc: '', techStack: [] as string[], coverUrl: '', demoUrl: '', githubUrl: '', giteeUrl: '', sort: 0, isShow: 1 })

async function handleSubmit() {
  loading.value = true
  try {
    if (isEdit.value) { await projectApi.update(route.params.id as string, form); ElMessage.success('更新成功') }
    else { await projectApi.create(form); ElMessage.success('创建成功') }
    router.push('/project')
  } finally { loading.value = false }
}

onMounted(async () => {
  if (isEdit.value) {
    const projects = await projectApi.list()
    const p = (projects as any[])?.find((item: any) => String(item.id) === String(route.params.id))
    if (p) Object.assign(form, { projectName: p.projectName, type: p.type || 0, shortDesc: p.shortDesc, fullDesc: p.fullDesc || '', techStack: p.techStack || [], coverUrl: p.coverUrl, demoUrl: p.demoUrl, githubUrl: p.githubUrl, giteeUrl: p.giteeUrl, sort: p.sort, isShow: p.isShow })
  }
})
</script>
