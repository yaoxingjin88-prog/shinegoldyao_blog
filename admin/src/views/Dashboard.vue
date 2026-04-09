<template>
  <div class="dashboard">
    <!-- 问候卡片 -->
    <el-card class="greeting-card" shadow="never">
      <div class="greeting-content">
        <div class="greeting-left">
          <div class="greeting-avatar">
            <el-icon :size="32" color="#fff"><UserFilled /></el-icon>
          </div>
          <div class="greeting-info">
            <h2 class="greeting-text">{{ greetingText }}，管理员 👋</h2>
            <p class="greeting-desc">这是您的管理控制台，您可以在这里管理博客的各项功能</p>
          </div>
        </div>
        <div class="greeting-right">
          <div class="greeting-time">{{ currentTime }}</div>
          <div class="greeting-date">{{ currentDate }}</div>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6" v-for="item in statCards" :key="item.title">
        <el-card class="stat-card" shadow="never">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: item.bg }">
              <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 + 更新日志 -->
    <el-row :gutter="16" class="bottom-row">
      <el-col :xs="24" :lg="14">
        <el-card class="shortcut-card" shadow="never">
          <template #header>
            <span class="card-header-title">快捷入口</span>
          </template>
          <div class="shortcut-grid">
            <div
              v-for="item in shortcuts"
              :key="item.label"
              class="shortcut-item"
              @click="$router.push(item.path)"
            >
              <div class="shortcut-icon" :style="{ background: item.bg }">
                <el-icon :size="22" :color="item.color"><component :is="item.icon" /></el-icon>
              </div>
              <span class="shortcut-label">{{ item.label }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card class="changelog-card" shadow="never">
          <template #header>
            <span class="card-header-title">更新日志</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="log in changelog"
              :key="log.version"
              :timestamp="log.date"
              placement="top"
              :color="log.color"
            >
              <div class="log-version">{{ log.version }}</div>
              <ul class="log-list">
                <li v-for="(item, i) in log.items" :key="i">{{ item }}</li>
              </ul>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { articleApi, projectApi, messageApi, categoryApi, tagApi } from '../api'

// --- 时钟 ---
const now = ref(new Date())
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => { now.value = new Date() }, 1000)
})
onUnmounted(() => clearInterval(timer))

const greetingText = computed(() => {
  const h = now.value.getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  if (h < 22) return '晚上好'
  return '夜深了'
})

const currentTime = computed(() =>
  now.value.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
)

const currentDate = computed(() => {
  const d = now.value
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日${weekdays[d.getDay()]}`
})

// --- 统计 ---
const stats = reactive({ articles: 0, projects: 0, messages: 0, categories: 0 })

const statCards = computed(() => [
  { title: '文章总数', value: stats.articles, icon: 'Document', color: '#6366f1', bg: '#eef2ff' },
  { title: '项目总数', value: stats.projects, icon: 'Briefcase', color: '#f43f5e', bg: '#fff1f2' },
  { title: '留言总数', value: stats.messages, icon: 'ChatDotSquare', color: '#0ea5e9', bg: '#f0f9ff' },
  { title: '分类总数', value: stats.categories, icon: 'Menu', color: '#10b981', bg: '#ecfdf5' },
])

onMounted(async () => {
  try {
    const [articles, projects, messages, categories] = await Promise.all([
      articleApi.list({ page: 1, pageSize: 1, isPublish: undefined }),
      projectApi.list(),
      messageApi.list({ page: 1, pageSize: 1 }),
      categoryApi.list(),
    ])
    stats.articles = articles?.total || 0
    stats.projects = Array.isArray(projects) ? projects.length : 0
    stats.messages = messages?.total || 0
    stats.categories = Array.isArray(categories) ? categories.length : 0
  } catch { /* ignore */ }
})

// --- 快捷入口 ---
const shortcuts = [
  { label: '写文章', path: '/article/create', icon: 'EditPen', color: '#6366f1', bg: '#eef2ff' },
  { label: '文章管理', path: '/article', icon: 'Document', color: '#0ea5e9', bg: '#f0f9ff' },
  { label: '分类管理', path: '/category', icon: 'FolderOpened', color: '#f59e0b', bg: '#fffbeb' },
  { label: '标签管理', path: '/tag', icon: 'PriceTag', color: '#10b981', bg: '#ecfdf5' },
  { label: '项目管理', path: '/project', icon: 'Briefcase', color: '#f43f5e', bg: '#fff1f2' },
  { label: '网站配置', path: '/site', icon: 'Setting', color: '#8b5cf6', bg: '#f5f3ff' },
  { label: '留言管理', path: '/message', icon: 'ChatDotSquare', color: '#ec4899', bg: '#fdf2f8' },
  { label: '特效控制', path: '/effects', icon: 'MagicStick', color: '#14b8a6', bg: '#f0fdfa' },
]

// --- 更新日志 ---
const changelog = [
  {
    version: 'v1.0.0',
    date: '2025-04-08',
    color: '#10b981',
    items: [
      '初始版本发布',
      '文章管理：支持 Markdown 编辑与发布',
      '项目展示：支持开源项目与推荐项目',
      '技术栈管理：分类展示技能熟练度',
      '网站配置：支持站点标题、简介等配置',
      '特效控制：流星雨特效参数可调',
    ],
  },
]
</script>

<style scoped>
.dashboard {
  padding: 4px;
}

/* 问候卡片 */
.greeting-card {
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
}
.greeting-card :deep(.el-card__body) {
  padding: 24px 28px;
}
.greeting-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}
.greeting-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.greeting-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.greeting-text {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}
.greeting-desc {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}
.greeting-right {
  text-align: right;
}
.greeting-time {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
}
.greeting-date {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 2px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 16px;
}
.stat-card {
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  cursor: default;
  transition: box-shadow 0.2s;
}
.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
.stat-card :deep(.el-card__body) {
  padding: 20px;
}
.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}
.stat-title {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 2px;
}

/* 底部区域 */
.bottom-row {
  margin-bottom: 16px;
}
.shortcut-card,
.changelog-card {
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  height: 100%;
}
.card-header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

/* 快捷入口 */
.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 12px 0;
  border-radius: 12px;
  transition: background 0.2s;
}
.shortcut-item:hover {
  background: #f9fafb;
}
.shortcut-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.shortcut-label {
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
}

/* 更新日志 */
.changelog-card :deep(.el-card__body) {
  max-height: 320px;
  overflow-y: auto;
}
.log-version {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}
.log-list {
  margin: 0;
  padding-left: 18px;
  list-style: disc;
}
.log-list li {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.8;
}

@media (max-width: 768px) {
  .shortcut-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .greeting-time {
    font-size: 28px;
  }
}
</style>
