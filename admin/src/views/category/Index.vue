<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>分类管理</h3>
      <el-button type="primary" @click="openDialog()">新增分类</el-button>
    </div>
    <el-table :data="list" border stripe>
      <el-table-column prop="categoryName" label="分类名称" />
      <el-table-column prop="slug" label="Slug" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column label="状态" width="80" align="center"><template #default="{ row }"><el-tag :type="row.isEnable ? 'success' : 'info'" size="small">{{ row.isEnable ? '启用' : '禁用' }}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editId ? '编辑分类' : '新增分类'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.categoryName" /></el-form-item>
        <el-form-item label="Slug"><el-input v-model="form.slug" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.isEnable" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { categoryApi } from '../../api'
import type { ArticleCategory } from '../../types'

const list = ref<ArticleCategory[]>([])
const dialogVisible = ref(false)
const editId = ref<string>('')
const form = reactive({ categoryName: '', slug: '', description: '', sort: 0, isEnable: 1 })

function openDialog(row?: ArticleCategory) {
  editId.value = row?.id || ''
  Object.assign(form, row || { categoryName: '', slug: '', description: '', sort: 0, isEnable: 1 })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (editId.value) await categoryApi.update(editId.value, form)
  else await categoryApi.create(form)
  ElMessage.success(editId.value ? '更新成功' : '创建成功')
  dialogVisible.value = false
  loadData()
}

async function handleDelete(id: string) { await categoryApi.remove(id); ElMessage.success('删除成功'); loadData() }
async function loadData() { list.value = (await categoryApi.list()) || [] }
onMounted(loadData)
</script>
