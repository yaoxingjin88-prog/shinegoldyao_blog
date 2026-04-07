<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>社交链接管理</h3>
      <el-button type="primary" @click="openDialog()">新增链接</el-button>
    </div>
    <el-table :data="list" border stripe>
      <el-table-column prop="platformName" label="平台名称" width="120" />
      <el-table-column prop="linkUrl" label="链接地址" />
      <el-table-column prop="iconUrl" label="图标URL" />
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column label="显示" width="80" align="center">
        <template #default="{ row }"><el-tag :type="row.isShow ? 'success' : 'info'" size="small">{{ row.isShow ? '显示' : '隐藏' }}</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
            <template #reference><el-button link type="danger">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑链接' : '新增链接'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="平台名称">
          <el-select v-model="form.platformName" allow-create filterable placeholder="选择或输入平台名">
            <el-option label="邮箱" value="邮箱" />
            <el-option label="GitHub" value="GitHub" />
            <el-option label="微信" value="微信" />
            <el-option label="Twitter" value="Twitter" />
            <el-option label="LinkedIn" value="LinkedIn" />
            <el-option label="掘金" value="掘金" />
          </el-select>
        </el-form-item>
        <el-form-item label="链接/账号"><el-input v-model="form.linkUrl" placeholder="填写链接可跳转，或填写账号/邮箱仅展示" /></el-form-item>
        <el-form-item label="图标URL"><el-input v-model="form.iconUrl" placeholder="可选，留空使用默认图标" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="显示"><el-switch v-model="form.isShow" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { socialApi } from '../../api'

const list = ref<any[]>([])
const dialogVisible = ref(false)
const editId = ref('')
const form = reactive({ platformName: '', linkUrl: '', iconUrl: '', sort: 0, isShow: 1 })

function openDialog(row?: any) {
  editId.value = row?.id || ''
  Object.assign(form, row || { platformName: '', linkUrl: '', iconUrl: '', sort: 0, isShow: 1 })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (editId.value) await socialApi.update(editId.value, form)
  else await socialApi.create(form)
  ElMessage.success(editId.value ? '更新成功' : '创建成功')
  dialogVisible.value = false
  loadData()
}

async function handleDelete(id: string) {
  await socialApi.remove(id)
  ElMessage.success('删除成功')
  loadData()
}

async function loadData() { list.value = (await socialApi.list()) || [] }
onMounted(loadData)
</script>
