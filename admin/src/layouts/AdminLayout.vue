<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <h2>DevVoyage</h2>
        <p>管理后台</p>
      </div>
      <el-menu :default-active="route.path" router unique-opened background-color="#1d1e1f" text-color="#bfcbd9" active-text-color="#409eff">
        <el-menu-item index="/dashboard"><el-icon><DataLine /></el-icon><span>仪表盘</span></el-menu-item>
        <el-sub-menu index="content">
          <template #title><el-icon><Document /></el-icon><span>内容管理</span></template>
          <el-menu-item index="/article">文章管理</el-menu-item>
          <el-menu-item index="/category">分类管理</el-menu-item>
          <el-menu-item index="/tag">标签管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="portfolio">
          <template #title><el-icon><Briefcase /></el-icon><span>作品展示</span></template>
          <el-menu-item index="/project">项目管理</el-menu-item>
          <el-menu-item index="/skill">技术栈管理</el-menu-item>
          <el-menu-item index="/experience">经历管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="system">
          <template #title><el-icon><Setting /></el-icon><span>系统管理</span></template>
          <el-menu-item index="/site">网站配置</el-menu-item>
          <el-menu-item index="/banner">轮播图管理</el-menu-item>
          <el-menu-item index="/message">留言管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div></div>
        <div class="header-right">
          <el-button type="danger" text @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="main"><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout { height: 100vh; }
.aside { background: #1d1e1f; overflow-y: auto; }
.logo { padding: 20px; text-align: center; color: #fff; border-bottom: 1px solid #333; }
.logo h2 { margin: 0; font-size: 20px; }
.logo p { margin: 4px 0 0; font-size: 12px; color: #999; }
.header { display: flex; align-items: center; justify-content: space-between; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
.main { background: #f5f7fa; }
</style>
