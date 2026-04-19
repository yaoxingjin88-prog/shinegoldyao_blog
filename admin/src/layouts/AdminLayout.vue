<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <div class="logo-icon">
          <!-- 与前台 Navbar 一致的四角星 logo -->
          <svg viewBox="0 0 24 24" fill="currentColor" class="logo-svg">
            <path d="M12 1.5C12.5 7.5 16.5 11.5 22.5 12C16.5 12.5 12.5 16.5 12 22.5C11.5 16.5 7.5 12.5 1.5 12C7.5 11.5 11.5 7.5 12 1.5Z" />
          </svg>
        </div>
        <div class="logo-text">
          <h2>ShineGoldYao</h2>
          <p>管理后台</p>
        </div>
      </div>
      <el-menu :default-active="route.path" router unique-opened background-color="transparent" text-color="#6b7280" active-text-color="#6366f1">
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
          <el-menu-item index="/social">社交链接</el-menu-item>
          <el-menu-item index="/banner">轮播图管理</el-menu-item>
          <el-menu-item index="/music">音乐管理</el-menu-item>
          <el-menu-item index="/message">留言管理</el-menu-item>
          <el-menu-item index="/effects">特效控制</el-menu-item>
          <el-menu-item index="/tool">工具导航</el-menu-item>
          <el-menu-item index="/track">访问统计</el-menu-item>
          <el-menu-item index="/heatmap">点击热力图</el-menu-item>
          <el-menu-item index="/ai-chat">AI 聊天记录</el-menu-item>
          <el-menu-item index="/ai-read-log">AI 阅读日志</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-breadcrumb">
          <el-icon :size="18" color="#9ca3af"><HomeFilled /></el-icon>
          <span class="header-breadcrumb-text">{{ currentPageTitle }}</span>
        </div>
        <div class="header-right">
          <NotificationBell />
          <el-button text @click="handleLogout" class="logout-btn">
            <el-icon style="margin-right:4px"><SwitchButton /></el-icon>
            退出登录
          </el-button>
        </div>
      </el-header>
      <el-main class="main"><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import NotificationBell from '../components/NotificationBell.vue'

// 登录后进入布局即触发 store 初始化，自动建立 WebSocket 连接
useNotificationStore()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const pageTitleMap: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/article': '文章管理',
  '/article/create': '写文章',
  '/category': '分类管理',
  '/tag': '标签管理',
  '/project': '项目管理',
  '/project/create': '新建项目',
  '/skill': '技术栈管理',
  '/experience': '经历管理',
  '/site': '网站配置',
  '/social': '社交链接',
  '/banner': '轮播图管理',
  '/music': '音乐管理',
  '/message': '留言管理',
  '/effects': '特效控制',
  '/tool': '工具导航管理',
  '/track': '访问统计',
  '/heatmap': '点击热力图',
  '/ai-chat': 'AI 聊天记录',
  '/ai-read-log': 'AI 阅读日志',
}

const currentPageTitle = computed(() => {
  for (const [path, title] of Object.entries(pageTitleMap)) {
    if (route.path === path || route.path.startsWith(path + '/')) return title
  }
  return '仪表盘'
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout { height: 100vh; }

/* 侧边栏 */
.aside {
  background: #fff;
  overflow-y: auto;
  border-right: 1px solid #f0f0f0;
  scrollbar-width: thin;
}
.aside::-webkit-scrollbar { width: 4px; }
.aside::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 8px;
}
.logo-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}
.logo-svg {
  width: 22px;
  height: 22px;
  color: #fff;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
}
.logo-text h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.3;
}
.logo-text p {
  margin: 0;
  font-size: 11px;
  color: #9ca3af;
  font-weight: 400;
}

/* 菜单样式覆盖 */
.aside :deep(.el-menu) {
  border-right: none;
  padding: 0 8px;
}
.aside :deep(.el-menu-item),
.aside :deep(.el-sub-menu__title) {
  height: 44px;
  line-height: 44px;
  border-radius: 8px;
  margin-bottom: 2px;
  font-size: 14px;
  transition: all 0.2s;
}
.aside :deep(.el-menu-item:hover),
.aside :deep(.el-sub-menu__title:hover) {
  background: #f5f3ff !important;
  color: #6366f1 !important;
}
.aside :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #6366f1, #818cf8) !important;
  color: #fff !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}
.aside :deep(.el-menu-item.is-active .el-icon) {
  color: #fff !important;
}
.aside :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #6366f1 !important;
  font-weight: 600;
}
.aside :deep(.el-sub-menu .el-menu-item) {
  padding-left: 52px !important;
  height: 40px;
  line-height: 40px;
  font-size: 13px;
  min-width: auto;
}
.aside :deep(.el-menu-item .el-icon),
.aside :deep(.el-sub-menu__title .el-icon) {
  font-size: 18px;
  width: 18px;
  margin-right: 8px;
}

/* 顶部栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
  height: 56px;
}
.header-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-breadcrumb-text {
  font-size: 15px;
  font-weight: 500;
  color: #4b5563;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logout-btn {
  color: #9ca3af !important;
  font-size: 13px;
}
.logout-btn:hover {
  color: #ef4444 !important;
}

/* 主内容区 */
.main {
  background: #f7f8fa;
}
</style>
