<template>
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px">
      <h3>项目管理</h3>
      <el-button type="primary" @click="$router.push('/project/create')">新增项目</el-button>
    </div>
    <el-table :data="list" border stripe>
      <el-table-column prop="projectName" label="项目名称" min-width="150" />
      <el-table-column label="类型" width="100" align="center"><template #default="{ row }"><el-tag :type="row.type === 1 ? 'warning' : 'primary'" size="small">{{ row.type === 1 ? '推荐' : '我的' }}</el-tag></template></el-table-column>
      <el-table-column prop="shortDesc" label="简介" min-width="200" show-overflow-tooltip />
      <el-table-column prop="sort" label="排序" width="70" align="center" />
      <el-table-column label="显示" width="70" align="center"><template #default="{ row }"><el-tag :type="row.isShow ? 'success' : 'info'" size="small">{{ row.isShow ? '是' : '否' }}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="$router.push(`/project/edit/${row.id}`)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { projectApi } from '../../api'
import type { Project } from '../../types'

const list = ref<Project[]>([])
async function loadData() { list.value = (await projectApi.list()) || [] }
async function handleDelete(id: string) { await projectApi.remove(id); ElMessage.success('删除成功'); loadData() }
onMounted(loadData)
</script>
