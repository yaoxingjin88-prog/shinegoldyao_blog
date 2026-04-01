<template>
  <div>
    <h2 style="margin-bottom:20px">仪表盘</h2>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="文章总数" :value="stats.articles" /><template #suffix><el-icon><Document /></el-icon></template></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="项目总数" :value="stats.projects" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="留言总数" :value="stats.messages" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="总阅读量" :value="stats.views" /></el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top:20px" shadow="hover">
      <template #header>快捷操作</template>
      <el-space>
        <el-button type="primary" @click="$router.push('/article/create')">写文章</el-button>
        <el-button @click="$router.push('/project/create')">新建项目</el-button>
        <el-button @click="$router.push('/message')">查看留言</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { articleApi, projectApi, messageApi } from '../api'

const stats = reactive({ articles: 0, projects: 0, messages: 0, views: 0 })

onMounted(async () => {
  try {
    const [articles, projects, messages] = await Promise.all([
      articleApi.list({ page: 1, pageSize: 1, isPublish: undefined }),
      projectApi.list(),
      messageApi.list({ page: 1, pageSize: 1 }),
    ])
    stats.articles = articles?.total || 0
    stats.projects = Array.isArray(projects) ? projects.length : 0
    stats.messages = messages?.total || 0
  } catch { /* ignore */ }
})
</script>
