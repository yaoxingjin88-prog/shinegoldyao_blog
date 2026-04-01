<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>标签管理</h3>
      <el-button type="primary" @click="openDialog()">新增标签</el-button>
    </div>
    <el-table :data="list" border stripe>
      <el-table-column prop="tagName" label="标签名" />
      <el-table-column prop="slug" label="Slug" />
      <el-table-column label="颜色" width="100"><template #default="{ row }"><el-tag :color="row.themeColor" size="small" style="color:#fff">{{ row.themeColor || '-' }}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editId ? '编辑标签' : '新增标签'" width="450px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.tagName" /></el-form-item>
        <el-form-item label="Slug"><el-input v-model="form.slug" /></el-form-item>
        <el-form-item label="颜色"><el-color-picker v-model="form.themeColor" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { tagApi } from '../../api'
import type { ArticleTag } from '../../types'

const list = ref<ArticleTag[]>([])
const dialogVisible = ref(false)
const editId = ref('')
const form = reactive({ tagName: '', slug: '', themeColor: '', description: '' })

function openDialog(row?: ArticleTag) {
  editId.value = row?.id || ''
  Object.assign(form, row || { tagName: '', slug: '', themeColor: '', description: '' })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (editId.value) await tagApi.update(editId.value, form)
  else await tagApi.create(form)
  ElMessage.success(editId.value ? '更新成功' : '创建成功')
  dialogVisible.value = false
  loadData()
}

async function handleDelete(id: string) { await tagApi.remove(id); ElMessage.success('删除成功'); loadData() }
async function loadData() { list.value = (await tagApi.list()) || [] }
onMounted(loadData)
</script>
