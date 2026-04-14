<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>经历管理</h3>
      <el-button type="primary" @click="openDialog()">新增经历</el-button>
    </div>
    <el-table :data="list" border stripe>
      <el-table-column label="类型" width="80" align="center"><template #default="{ row }"><el-tag :type="row.type===1?'success':'primary'" size="small">{{ row.type===1?'教育':'工作' }}</el-tag></template></el-table-column>
      <el-table-column prop="orgName" label="机构/公司" />
      <el-table-column prop="position" label="职位/专业" />
      <el-table-column label="时间" width="200"><template #default="{ row }">{{ formatDate(row.startDate) }} ~ {{ formatDate(row.endDate) || '至今' }}</template></el-table-column>
      <el-table-column prop="sort" label="排序" width="70" align="center" />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editId ? '编辑经历' : '新增经历'" width="550px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="类型"><el-radio-group v-model="form.type"><el-radio :value="1">教育</el-radio><el-radio :value="2">工作</el-radio></el-radio-group></el-form-item>
        <el-form-item label="机构/公司"><el-input v-model="form.orgName" /></el-form-item>
        <el-form-item label="职位/专业"><el-input v-model="form.position" /></el-form-item>
        <el-form-item label="开始日期"><el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="结束日期"><el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width:100%" clearable /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="显示"><el-switch v-model="form.isShow" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { experienceApi } from '../../api'
import type { Experience } from '../../types'

const list = ref<Experience[]>([])
const dialogVisible = ref(false)
const editId = ref('')
const form = reactive({ type: 2, orgName: '', position: '', startDate: '', endDate: '' as string | null, description: '', sort: 0, isShow: 1 })

function openDialog(row?: Experience) {
  editId.value = row?.id || ''
  Object.assign(form, row || { type: 2, orgName: '', position: '', startDate: '', endDate: null, description: '', sort: 0, isShow: 1 })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (editId.value) await experienceApi.update(editId.value, form)
  else await experienceApi.create(form)
  ElMessage.success(editId.value ? '更新成功' : '创建成功')
  dialogVisible.value = false; loadData()
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  if (typeof date === 'string') return date.slice(0, 10)
  if (date instanceof Date) return date.toISOString().slice(0, 10)
  return String(date).slice(0, 10)
}

async function handleDelete(id: string) { await experienceApi.remove(id); ElMessage.success('删除成功'); loadData() }
async function loadData() { list.value = (await experienceApi.list()) || [] }
onMounted(loadData)
</script>
