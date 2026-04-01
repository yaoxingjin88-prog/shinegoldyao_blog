<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>轮播图管理</h3>
      <el-button type="primary" @click="openDialog()">新增轮播图</el-button>
    </div>
    <el-table :data="list" border stripe>
      <el-table-column label="图片" width="120"><template #default="{ row }"><el-image :src="row.imageUrl" style="width:80px;height:45px" fit="cover" /></template></el-table-column>
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="linkUrl" label="链接" show-overflow-tooltip />
      <el-table-column prop="sort" label="排序" width="70" align="center" />
      <el-table-column label="启用" width="70" align="center"><template #default="{ row }"><el-tag :type="row.isEnable?'success':'info'" size="small">{{ row.isEnable?'是':'否' }}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editId ? '编辑轮播图' : '新增轮播图'" width="550px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" /></el-form-item>
        <el-form-item label="图片URL"><el-input v-model="form.imageUrl" /></el-form-item>
        <el-form-item label="链接"><el-input v-model="form.linkUrl" /></el-form-item>
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
import { bannerApi } from '../../api'
import type { Banner } from '../../types'

const list = ref<Banner[]>([])
const dialogVisible = ref(false)
const editId = ref('')
const form = reactive({ title: '', description: '', imageUrl: '', linkUrl: '#', sort: 0, isEnable: 1 })

function openDialog(row?: Banner) {
  editId.value = row?.id || ''
  Object.assign(form, row || { title: '', description: '', imageUrl: '', linkUrl: '#', sort: 0, isEnable: 1 })
  dialogVisible.value = true
}
async function handleSubmit() {
  if (editId.value) await bannerApi.update(editId.value, form)
  else await bannerApi.create(form)
  ElMessage.success(editId.value ? '更新成功' : '创建成功')
  dialogVisible.value = false; loadData()
}
async function handleDelete(id: string) { await bannerApi.remove(id); ElMessage.success('删除成功'); loadData() }
async function loadData() { list.value = (await bannerApi.list()) || [] }
onMounted(loadData)
</script>
