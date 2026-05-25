<template>
  <div class="pt-24 pb-16">
    <div class="max-w-6xl mx-auto px-6">
      <!-- 页面头部 -->
      <div class="text-center max-w-2xl mx-auto mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm mb-6">
          <Route class="w-4 h-4" />
          {{ $t('roadmap.badge') }}
        </div>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-6">
          {{ $t('roadmap.title') }} <span class="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{{ $t('roadmap.titleHighlight') }}</span>
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-lg">
          {{ $t('roadmap.subtitle') }}
        </p>
      </div>

      <!-- 学习路线网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="roadmap in roadmaps"
          :key="roadmap.id"
          class="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-500 cursor-pointer overflow-hidden"
          @click="openRoadmap(roadmap)"
        >
          <!-- 背景装饰 -->
          <div class="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-500" :class="roadmap.bgGradient">
            <div class="absolute inset-0 rounded-full blur-3xl"></div>
          </div>

          <!-- 图标 -->
          <div class="relative mb-5">
            <div class="w-14 h-14 rounded-xl flex items-center justify-center" :class="roadmap.iconBgClass">
              <component :is="roadmap.icon" v-if="roadmap.icon" class="w-7 h-7" :class="roadmap.iconClass" />
            </div>
          </div>

          <!-- 标题和描述 -->
          <h3 class="text-xl font-bold mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {{ roadmap.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-5">
            {{ roadmap.description }}
          </p>

          <!-- 核心内容预览 -->
          <div class="space-y-3 mb-6">
            <div v-for="(item, index) in roadmap.previewItems" :key="index" class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" :class="roadmap.dotClass"></div>
              <div>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ item.title }}</span>
                <p class="text-xs text-gray-500 dark:text-gray-500">{{ item.content }}</p>
              </div>
            </div>
          </div>

          <!-- 查看完整路线 -->
          <div class="flex items-center gap-2 text-sm font-medium" :class="roadmap.linkClass">
            <span>查看完整路线</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <!-- 更多路线规划中卡片 -->
        <div class="group relative bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[320px]">
          <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Plus class="w-8 h-8 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 class="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">更多路线规划中</h3>
          <p class="text-sm text-gray-500 dark:text-gray-500 max-w-[200px]">
            AI 算法、Go 微服务、Rust 底层开发等路线正在爆肝整理中...
          </p>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <Transition name="modal">
      <div v-if="selectedRoadmap" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="closeRoadmap">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- 弹窗内容 -->
        <div class="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <!-- 头部 -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="selectedRoadmap.iconBgClass">
                <component :is="selectedRoadmap.icon" v-if="selectedRoadmap.icon" class="w-6 h-6" :class="selectedRoadmap.iconClass" />
              </div>
              <div>
                <h2 class="text-xl font-bold">{{ selectedRoadmap.title }}</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ selectedRoadmap.description }}</p>
              </div>
            </div>
            <button
              @click="closeRoadmap"
              class="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- 内容区域 -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="space-y-8">
              <div v-for="(section, index) in selectedRoadmap.sections" :key="index" class="relative">
                <!-- 时间线 -->
                <div class="flex gap-4">
                  <div class="flex flex-col items-center">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" :class="section.stepClass">
                      {{ index + 1 }}
                    </div>
                    <div v-if="index < selectedRoadmap.sections.length - 1" class="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2"></div>
                  </div>
                  <div class="flex-1 pb-8">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-lg font-bold">{{ section.title }}</h3>
                      <span v-if="section.time" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        {{ section.time }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ section.description }}</p>

                    <!-- 技能标签 -->
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="skill in section.skills"
                        :key="skill"
                        class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                      >
                        {{ skill }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部 -->
          <div class="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                预计学习周期: {{ selectedRoadmap.duration }}
              </span>
              <button
                @click="closeRoadmap"
                class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
              >
                开始探索
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  Route, ArrowRight, Plus, X,
  Zap, Layout, Server, Coffee, Database, Terminal, Brain
} from 'lucide-vue-next'
import type { Component } from 'vue'

// 学习路线数据
const roadmaps = ref([
  {
    id: 'modern-dev',
    title: '现代开发基建路线',
    description: '面向未来的开发思维，从 AI 辅助编程到云原生部署，掌握现代软件工程全链路工具链，让开发效率飞升。',
    icon: Zap,
    iconBgClass: 'bg-amber-100 dark:bg-amber-900/30',
    iconClass: 'text-amber-600 dark:text-amber-400',
    bgGradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
    dotClass: 'bg-amber-500',
    linkClass: 'text-amber-600 dark:text-amber-400',
    duration: '2-4 个月',
    previewItems: [
      { title: 'AI 效率工具', content: 'Cursor / GitHub Copilot / Claude Code / Prompt 工程' },
      { title: '版本管理 & CI/CD', content: 'Git 工作流 / GitHub Actions / Jenkins / 自动化发布' },
      { title: '容器化与编排', content: 'Docker / Docker Compose / Kubernetes 入门' },
      { title: '云原生部署', content: 'Vercel / Cloudflare / Serverless / 边缘计算' },
    ],
    sections: [
      {
        title: 'AI 辅助编程',
        time: '1-2 周',
        description: '将 AI 融入日常开发工作流，显著提升编码效率和代码质量',
        stepClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
        skills: ['Cursor 编辑器深度使用', 'GitHub Copilot 代码补全', 'Claude Code CLI 工具', 'Prompt 工程与提示词优化', 'AI 代码审查与重构', 'AI 辅助 Debugging']
      },
      {
        title: 'Git 工作流与 CI/CD',
        time: '2-3 周',
        description: '从版本管理到自动化流水线，构建高效团队协作体系',
        stepClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
        skills: ['Git 分支策略 (Git Flow / Trunk Based)', 'Rebase / Cherry-pick / Hooks 高级操作', 'Monorepo 管理 (Turborepo / Nx)', 'GitHub Actions / Jenkins 流水线', '代码质量门禁 (ESLint / Prettier / SonarQube)', '自动化发布与 Changelog']
      },
      {
        title: '容器化与云原生部署',
        time: '2-3 周',
        description: '用容器统一环境，上云实现弹性伸缩与全球部署',
        stepClass: 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300',
        skills: ['Docker 镜像构建与 Dockerfile 最佳实践', 'Docker Compose 多服务编排', 'Kubernetes 核心概念入门', 'Vercel / Cloudflare / Serverless 部署', 'CDN 缓存策略与环境变量管理', 'Supabase / Firebase BaaS']
      },
      {
        title: '监控与可观测性',
        time: '1-2 周',
        description: '上线不是终点，监控让你在用户发现前解决问题',
        stepClass: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
        skills: ['Sentry 错误监控与报警', 'APM 性能监控 (Grafana)', 'Core Web Vitals 指标优化', '日志收集与分析', 'Uptime 监控与告警', '分布式链路追踪']
      }
    ]
  },
  {
    id: 'frontend',
    title: '大前端开发路线',
    description: '超越切图仔，系统掌握 HTML/CSS/JS 基础、主流框架、工程化体系、性能优化与跨端开发，进阶资深前端工程师。',
    icon: Layout,
    iconBgClass: 'bg-blue-100 dark:bg-blue-900/30',
    iconClass: 'text-blue-600 dark:text-blue-400',
    bgGradient: 'bg-gradient-to-br from-blue-400 to-cyan-500',
    dotClass: 'bg-blue-500',
    linkClass: 'text-blue-600 dark:text-blue-400',
    duration: '6-12 个月',
    previewItems: [
      { title: 'HTML/CSS 基石', content: '语义化 / Flex & Grid / 响应式 / CSS 变量 / 动画' },
      { title: 'JavaScript/TypeScript', content: 'ES6+ / 异步编程 / 类型系统 / 设计模式' },
      { title: '框架生态', content: 'Vue3 & Nuxt3 / React & Next.js / 状态管理' },
      { title: '工程化与进阶', content: 'Vite / Webpack / 性能优化 / 跨端 / 可视化' },
    ],
    sections: [
      {
        title: 'HTML & CSS 基石',
        time: '2-3 周',
        description: '夯实基础，语义化、布局系统、响应式设计缺一不可',
        stepClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        skills: ['HTML5 语义化标签与 SEO', 'Flexbox 弹性布局', 'CSS Grid 网格布局', '响应式设计与媒体查询', 'CSS 变量与主题切换', 'CSS 动画与过渡 (Transition/Animation)', 'BEM 命名规范']
      },
      {
        title: 'JavaScript & TypeScript',
        time: '4-6 周',
        description: '深入语言核心，从 ES6+ 语法到 TypeScript 类型体操',
        stepClass: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
        skills: ['ES6+ 核心语法 (解构/Promise/async-await)', '闭包、原型链、作用域深入', 'TypeScript 类型系统与泛型', 'Event Loop 与异步编程', '模块化规范 (ESM/CJS)', '前端设计模式 (观察者/发布订阅/策略)']
      },
      {
        title: 'Vue 生态',
        time: '3-4 周',
        description: '掌握 Vue3 全家桶和 Nuxt3 全栈框架',
        stepClass: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
        skills: ['Vue3 Composition API', '响应式原理 (Proxy/Effect)', 'Vue Router 路由管理', 'Pinia 状态管理', 'Nuxt3 SSR/SSG 全栈开发', 'Vue 组件设计与通信模式']
      },
      {
        title: 'React 生态',
        time: '3-4 周',
        description: '掌握 React Hooks 和 Next.js 全栈方案',
        stepClass: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
        skills: ['React Hooks 深度使用', 'JSX 与虚拟 DOM 原理', 'React Router 路由', '状态管理 (Zustand / Redux Toolkit)', 'Next.js App Router 与 RSC', 'Server Actions 与数据获取']
      },
      {
        title: '工程化与性能优化',
        time: '3-4 周',
        description: '构建工具、代码质量、性能优化三位一体',
        stepClass: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
        skills: ['Vite 构建原理与配置', 'Webpack 核心概念 (Loader/Plugin)', 'Tree Shaking 与代码分割', 'Core Web Vitals 优化 (LCP/FID/CLS)', '图片优化 (懒加载/WebP/AVIF)', 'Service Worker 与离线缓存']
      },
      {
        title: '高级领域',
        time: '4-6 周',
        description: '跨端开发、可视化、微前端，拓宽技术边界',
        stepClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300',
        skills: ['WebGL 与 Three.js 3D 可视化', 'Canvas 与 SVG 图表 (ECharts/D3)', '微前端架构 (qiankun/Module Federation)', 'Taro / uni-app 跨端开发', 'React Native / Flutter 移动端', 'WebAssembly 高性能计算']
      }
    ]
  },
  {
    id: 'nodejs',
    title: 'Node.js 全栈路线',
    description: '一种语言打通前后端。从 Node.js 运行时原理到 NestJS 企业级架构，再到数据库、鉴权、微服务，构建完整后端能力。',
    icon: Server,
    iconBgClass: 'bg-green-100 dark:bg-green-900/30',
    iconClass: 'text-green-600 dark:text-green-400',
    bgGradient: 'bg-gradient-to-br from-green-400 to-emerald-500',
    dotClass: 'bg-green-500',
    linkClass: 'text-green-600 dark:text-green-400',
    duration: '4-7 个月',
    previewItems: [
      { title: '运行时核心', content: 'Event Loop / Stream / Buffer / 子进程 / Cluster' },
      { title: 'Web 框架', content: 'Express / Koa / Fastify / NestJS 企业级架构' },
      { title: '数据库与缓存', content: 'PostgreSQL / MongoDB / Prisma / Redis' },
      { title: '安全与部署', content: 'JWT / OAuth2 / Docker / PM2 / 微服务' },
    ],
    sections: [
      {
        title: 'Node.js 基础与核心模块',
        time: '2-3 周',
        description: '理解运行时机制，掌握核心 API',
        stepClass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        skills: ['Event Loop 事件循环机制', 'Stream 流式处理', 'Buffer 与二进制数据', 'fs / path / http 核心模块', '子进程与 Cluster 多进程', 'npm 包管理与发布']
      },
      {
        title: 'Web 框架',
        time: '3-4 周',
        description: '从轻量框架到企业级架构，按需选择',
        stepClass: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        skills: ['Express 中间件机制与路由', 'Koa 洋葱模型与 async/await', 'Fastify 高性能框架', 'NestJS 依赖注入与模块化', 'NestJS Guard / Interceptor / Pipe', 'Swagger API 文档自动生成']
      },
      {
        title: '数据库与 ORM',
        time: '3-4 周',
        description: '关系型与 NoSQL 数据库选型，ORM 提升开发效率',
        stepClass: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
        skills: ['PostgreSQL 高级查询与索引', 'MongoDB 文档模型设计', 'Prisma Schema 与 Migration', 'TypeORM / Sequelize 对比', 'Redis 缓存策略与数据结构', '数据库连接池与事务']
      },
      {
        title: '认证与安全',
        time: '2-3 周',
        description: '保护 API 和用户数据，防范常见攻击',
        stepClass: 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300',
        skills: ['JWT 签发与刷新机制', 'OAuth2 第三方登录 (GitHub/微信)', 'RBAC 权限模型设计', 'XSS / CSRF / SQL 注入防护', 'bcrypt 密码哈希与盐值', 'CORS / CSP / Helmet 安全头']
      },
      {
        title: '高级架构与部署',
        time: '3-4 周',
        description: '实时通信、消息队列、微服务拆分与容器化部署',
        stepClass: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
        skills: ['WebSocket / Socket.IO 实时通信', 'RabbitMQ / Redis Pub/Sub 消息队列', 'NestJS 微服务架构 (TCP/gRPC)', 'Docker 镜像构建与 Compose', 'PM2 + Nginx 反向代理与负载均衡', 'GraphQL Federation 联邦架构']
      }
    ]
  },
  {
    id: 'java',
    title: 'Java 全栈开发路线',
    description: '企业级开发的常青树。从 Java 语言核心到 JVM 调优，从 Spring Boot 到 Spring Cloud 微服务，再到高并发中间件，斩获大厂 Offer。',
    icon: Coffee,
    iconBgClass: 'bg-rose-100 dark:bg-rose-900/30',
    iconClass: 'text-rose-600 dark:text-rose-400',
    bgGradient: 'bg-gradient-to-br from-rose-400 to-red-500',
    dotClass: 'bg-rose-500',
    linkClass: 'text-rose-600 dark:text-rose-400',
    duration: '8-12 个月',
    previewItems: [
      { title: 'Java 核心内功', content: '面向对象 / 集合框架 / 反射 / 注解 / IO/NIO' },
      { title: 'JVM 原理', content: '内存模型 / GC 算法 / 类加载 / JIT / 调优工具' },
      { title: 'Spring 生态', content: 'Spring Boot 3 / Spring MVC / Spring Security / AOP' },
      { title: '分布式与微服务', content: 'Spring Cloud / Nacos / Sentinel / Seata / Redis' },
    ],
    sections: [
      {
        title: 'Java 语言核心',
        time: '4-6 周',
        description: '夯实 Java 基础，理解面向对象精髓和底层实现',
        stepClass: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
        skills: ['面向对象设计原则 (SOLID)', '集合框架源码 (HashMap/ConcurrentHashMap)', '泛型与类型擦除', '反射与注解处理器', 'IO / NIO / AIO 模型', 'Java 17+ 新特性 (Sealed/Pattern Matching)']
      },
      {
        title: 'JVM 原理与调优',
        time: '3-4 周',
        description: '理解虚拟机运行机制，掌握性能调优实战',
        stepClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        skills: ['JVM 内存模型 (堆/栈/方法区)', 'GC 算法与收集器 (G1/ZGC/Shenandoah)', '类加载机制与双亲委派', 'JIT 即时编译与逃逸分析', 'JPS / Jstack / Jmap / MAT 工具', '线上 OOM / CPU 飙高排查']
      },
      {
        title: '并发编程',
        time: '3-4 周',
        description: '掌握多线程和高并发核心能力',
        stepClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
        skills: ['线程生命周期与状态流转', 'synchronized 与 ReentrantLock', 'volatile 与内存可见性', '线程池原理与参数调优', 'AQS 阻塞队列与条件变量', 'CompletableFuture 异步编排', 'ThreadLocal 与内存泄漏']
      },
      {
        title: 'Spring 生态全家桶',
        time: '4-6 周',
        description: '企业级开发的事实标准，从 IoC 到微服务',
        stepClass: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
        skills: ['Spring IoC 容器与依赖注入', 'Spring AOP 切面编程', 'Spring Boot 3 自动配置原理', 'Spring MVC 请求处理全流程', 'Spring Security 认证授权', 'MyBatis-Plus 高效 CRUD', 'Spring Data JPA 与 Specification']
      },
      {
        title: '分布式与微服务',
        time: '4-6 周',
        description: 'Spring Cloud 生态构建分布式系统',
        stepClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300',
        skills: ['Nacos 注册中心与配置中心', 'OpenFeign 远程调用', 'Sentinel 熔断降级限流', 'Seata 分布式事务 (AT/TCC/Saga)', 'Gateway 网关与路由过滤', 'SkyWalking 链路追踪']
      },
      {
        title: '高并发与中间件',
        time: '3-4 周',
        description: 'Redis、MQ、MySQL 调优，支撑海量并发',
        stepClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
        skills: ['Redis 数据结构与持久化', 'Redis 分布式锁与缓存穿透/击穿/雪崩', 'RabbitMQ / RocketMQ 消息队列', 'MySQL 索引优化与慢查询', '分库分表 (ShardingSphere)', '读写分离与主从同步']
      }
    ]
  },
  {
    id: 'python',
    title: 'Python 爬虫与数据路线',
    description: '获取互联网公开数据的利器。从 HTTP 请求到数据解析，从自动化浏览器到 Scrapy 框架，从反爬对抗到数据清洗分析，全流程打通。',
    icon: Database,
    iconBgClass: 'bg-purple-100 dark:bg-purple-900/30',
    iconClass: 'text-purple-600 dark:text-purple-400',
    bgGradient: 'bg-gradient-to-br from-purple-400 to-pink-500',
    dotClass: 'bg-purple-500',
    linkClass: 'text-purple-600 dark:text-purple-400',
    duration: '3-5 个月',
    previewItems: [
      { title: '基础获取与解析', content: 'Requests / httpx / BeautifulSoup / lxml / 正则' },
      { title: '自动化与框架', content: 'Selenium / Playwright / Scrapy / 分布式爬虫' },
      { title: '反爬对抗', content: 'JS 逆向 / 代理池 / 验证码 / 浏览器指纹' },
      { title: '数据分析', content: 'Pandas / Matplotlib / 定时采集 / 数据导出' },
    ],
    sections: [
      {
        title: 'Python 基础与 HTTP 协议',
        time: '1-2 周',
        description: '打好 Python 基础，理解网络请求底层原理',
        stepClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        skills: ['Python 语法快速上手', 'HTTP/HTTPS 协议详解', 'Cookie / Session / Token 机制', 'Requests 库基本使用', 'httpx 异步请求', 'cURL 与 Postman 调试']
      },
      {
        title: '数据解析与提取',
        time: '2-3 周',
        description: '从 HTML/JSON/XML 中精准提取目标数据',
        stepClass: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
        skills: ['BeautifulSoup HTML 解析', 'lxml 与 XPath 表达式', 'CSS 选择器提取', '正则表达式 (re 模块)', 'JSON / JSONPath 数据提取', 'XML 与 CSV 数据处理']
      },
      {
        title: '自动化浏览器与 Scrapy 框架',
        time: '3-4 周',
        description: '应对动态页面，掌握工业化爬虫开发',
        stepClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300',
        skills: ['Selenium / Playwright 自动化操作', '无头浏览器与页面截图', 'Scrapy 架构 (Spider/Item/Pipeline)', 'Scrapy-Redis 分布式爬虫', 'CrawlSpider 自动链接跟进', '数据管道与存储 (MySQL/MongoDB)']
      },
      {
        title: '反爬对抗与逆向',
        time: '3-4 周',
        description: '突破反爬机制，获取加密接口数据',
        stepClass: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
        skills: ['JS 逆向分析 (扣代码/补环境)', 'Webpack 混淆还原', 'App 抓包与逆向 (Frida/Xposed)', '代理池构建与 IP 轮换', '验证码识别 (OCR/打码平台)', '浏览器指纹与 Playwright-stealth']
      },
      {
        title: '数据清洗与分析',
        time: '2-3 周',
        description: '爬来的数据要能用，清洗和分析是最后一步',
        stepClass: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
        skills: ['Pandas DataFrame 数据操作', '缺失值与异常值处理', '数据合并与透视表', 'Matplotlib / Pyecharts 可视化', '数据导出 (Excel/CSV/数据库)', '定时任务与自动化采集 (APScheduler)']
      }
    ]
  },
  {
    id: 'ai-agent',
    title: 'AI Agent 开发路线',
    description: '从 LLM 基础到多 Agent 系统，掌握 Prompt Engineering、RAG、LangGraph、MCP 协议与 Agent 工程化，构建生产级智能体应用。',
    icon: Brain,
    iconBgClass: 'bg-sky-100 dark:bg-sky-900/30',
    iconClass: 'text-sky-600 dark:text-sky-400',
    bgGradient: 'bg-gradient-to-br from-sky-400 to-cyan-500',
    dotClass: 'bg-sky-500',
    linkClass: 'text-sky-600 dark:text-sky-400',
    duration: '12-20 周',
    previewItems: [
      { title: 'LLM 基础', content: 'Prompt Engineering / Function Calling / Embedding' },
      { title: 'RAG 检索增强', content: '向量数据库 / RAG Pipeline / Hybrid Search / GraphRAG' },
      { title: 'Agent 核心框架', content: 'LangChain / LangGraph / MCP 协议 / OpenAI SDK' },
      { title: '多 Agent 与工程化', content: 'CrewAI / AutoGen / Eval / 可观测性 / 生产部署' },
    ],
    sections: [
      {
        title: 'LLM 基础',
        time: '1-2 周',
        description: '真正理解大模型开发，不只是会调 API',
        stepClass: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
        skills: ['Prompt Engineering (System/Few-shot/CoT/ReAct)', 'Structured Output 与 JSON Mode', 'Function Calling / Tool Calling 原理', 'JSON Schema 与参数验证', 'Embedding 与向量表示', 'Cosine Similarity / Chunking / Rerank']
      },
      {
        title: 'Python AI 生态',
        time: '2-3 周',
        description: 'AI 世界的事实标准语言，掌握核心工具链',
        stepClass: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
        skills: ['Python async / class / typing', 'Pydantic 数据验证', 'FastAPI 构建 AI 服务', 'Jupyter Notebook 调试', 'Prompt 调试与迭代', 'Embedding 可视化与调试']
      },
      {
        title: 'RAG 检索增强生成',
        time: '2-4 周',
        description: '现代 Agent 80% 都离不开 RAG，必须完整掌握',
        stepClass: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
        skills: ['文档切片 (Chunk Size / Overlap)', '向量数据库 (Qdrant / Pinecone / pgvector)', 'RAG Pipeline 全流程', 'Hybrid Search 混合检索', 'GraphRAG 图谱增强', 'Agentic RAG / Self-RAG']
      },
      {
        title: 'LangChain 与 LangGraph',
        time: '3-4 周',
        description: '掌握主流 Agent 框架，重点理解状态机工作流',
        stepClass: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
        skills: ['LangChain (Chains/Tools/Memory/Agents)', 'LangGraph 状态机 (State/Node/Edge)', '条件路由与 Human-in-the-loop', 'Retry 重试与错误恢复', 'LangSmith 追踪与调试', '工作流可视化与调试']
      },
      {
        title: 'MCP 协议与 OpenAI SDK',
        time: '2-3 周',
        description: '掌握 Agent 的 "USB 协议" 和 OpenAI 官方 Agent 方案',
        stepClass: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
        skills: ['MCP 协议核心概念', 'MCP Server 开发 (Tool Exposure)', 'MCP Client 集成', 'IDE 集成 (VS Code / Cursor)', 'OpenAI Agents SDK (Handoff/Tracing)', 'MCP 生态与第三方工具接入']
      },
      {
        title: '多 Agent 系统',
        time: '2-3 周',
        description: '进入高阶领域，构建 Agent 协作架构',
        stepClass: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
        skills: ['Multi-Agent 架构模式', 'Planner / Executor / Reviewer / Critic', 'CrewAI 协作框架', 'Microsoft AutoGen 框架', 'Agent 通信与编排', '理解协作原理而非只会调框架']
      },
      {
        title: 'Agent 工程化与实战',
        time: '2-4 周',
        description: '真正拉开差距的一层，从 Demo 到生产级应用',
        stepClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300',
        skills: ['AI 可观测性 (Tracing / Token Usage)', 'Hallucination Eval / RAG Eval', 'Semantic Cache / Redis 缓存优化', 'Streaming 流式输出', 'Docker + Nginx 部署', '实战: 客服机器人 / 知识库 / 代码助手']
      }
    ]
  },
  {
    id: 'node-agent',
    title: 'Node Agent 开发路线',
    description: '用 Node.js/TypeScript 构建 AI Agent。从 OpenAI SDK 到 Tool Calling、RAG、LangGraph、MCP 协议，再到 AI 工程化，Node 全栈工程师的 Agent 进阶之路。',
    icon: Terminal,
    iconBgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    bgGradient: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    dotClass: 'bg-emerald-500',
    linkClass: 'text-emerald-600 dark:text-emerald-400',
    duration: '9-13 周',
    previewItems: [
      { title: 'Node AI 基础', content: 'OpenAI SDK / 流式输出 SSE / Prompt Engineering' },
      { title: 'Tool Calling', content: 'Function Calling / Zod Schema / Agent Loop 实现' },
      { title: 'RAG 检索增强', content: 'Embedding / pgvector / Qdrant / RAG Pipeline' },
      { title: 'Agent 框架与工程化', content: 'LangGraph / MCP 协议 / 可观测性 / Prompt 管理' },
    ],
    sections: [
      {
        title: 'Node AI 基础',
        time: '1-2 周',
        description: '让 Node.js 真正接入 AI 世界，掌握 OpenAI SDK 全套能力',
        stepClass: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        skills: ['OpenAI SDK Chat Completion', 'Streaming 流式输出 (SSE / WebSocket)', 'Structured Output 与 JSON Mode', 'Tool Calling 基础', 'async iterator 异步迭代器', 'Prompt Engineering (System/Few-shot/Schema)']
      },
      {
        title: 'Tool Calling 与 Agent Loop',
        time: '2-3 周',
        description: 'Agent 本质是 LLM + Tool System，从底层理解 Agent 运行机制',
        stepClass: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
        skills: ['Function Calling 完整流程', 'Zod Schema 定义与验证', 'Tool Router 工具路由', '自实现 Agent Loop (while + LLM + Tool)', '工具执行结果回传与上下文管理', '理解底层而非只会框架']
      },
      {
        title: 'RAG 检索增强生成',
        time: '2-3 周',
        description: '企业 AI 几乎都需要 RAG，用 Node 独立实现完整链路',
        stepClass: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
        skills: ['Embedding 生成与 Similarity Search', 'PostgreSQL + pgvector 向量存储', 'Qdrant 向量数据库', '文档上传 → Chunk → Embedding → 存储', '检索 → Rerank → 拼 Prompt → 回答', 'Chunk Size / Overlap 策略调优']
      },
      {
        title: 'Agent 框架与 MCP 协议',
        time: '3-4 周',
        description: '掌握 LangGraph 状态机和 MCP 协议，构建完整 Agent 系统',
        stepClass: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
        skills: ['LangChain.js (Tools / Memory / Agent / Retriever)', 'LangGraph 状态机 (State/Node/Edge)', '条件路由与 Human-in-the-loop', 'MCP 协议核心概念与 Server 开发', 'MCP Client 集成与 IDE 接入', 'OpenAI Agents SDK (Handoff/Tracing)']
      },
      {
        title: 'AI 工程化',
        time: '2-3 周',
        description: '真正拉开差距的一层，企业最缺的 AI 工程能力',
        stepClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300',
        skills: ['AI 可观测性 (Tracing / Token Logging)', 'LangSmith 监控与调试', 'Latency 与性能分析', 'Prompt 版本管理与模板化', 'Prompt Testing 自动化测试', 'Streaming 优化与 Semantic Cache']
      }
    ]
  }
])

const selectedRoadmap = ref<typeof roadmaps.value[0] | null>(null)

function openRoadmap(roadmap: typeof roadmaps.value[0]) {
  selectedRoadmap.value = roadmap
  document.body.style.overflow = 'hidden'
}

function closeRoadmap() {
  selectedRoadmap.value = null
  document.body.style.overflow = ''
}

// ESC 关闭弹窗
const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeRoadmap()
}

onMounted(() => {
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc)
})

useHead({
  title: '学习路线 - 姚兴金的技术博客',
  meta: [
    { name: 'description', content: '精心整理的技术学习路线，涵盖前端、后端、Python爬虫、Java等方向，助你系统化学习编程技能。' },
    { name: 'keywords', content: '姚兴金,学习路线,前端学习,后端学习,Python爬虫,Java学习,技术成长' },
    { property: 'og:title', content: '学习路线 - 姚兴金的技术博客' },
    { property: 'og:url', content: 'https://shinegoldyao.store/roadmap' },
  ],
  link: [{ rel: 'canonical', href: 'https://shinegoldyao.store/roadmap' }],
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>
