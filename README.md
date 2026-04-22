# DevVoyage · ShineGoldYao 技术博客

> 一个现代化的全栈个人技术博客系统，采用前后端分离 + 后台管理三端架构，支持 SSR、沉浸式 AI 辅助创作（Co-pilot）、PWA 离线阅读、国际化、深色模式、Markdown 文章、AI 助手、访问统计等完整功能。

**在线地址**：[https://shinegoldyao.store](https://shinegoldyao.store)

---

## 目录

- [项目概览](#项目概览)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [功能模块](#功能模块)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [开发指南](#开发指南)
- [部署](#部署)
- [性能优化](#性能优化)
- [API 文档](#api-文档)

---

## 项目概览

本项目由 **三个独立应用** 组成：

| 应用 | 目录 | 端口 | 说明 |
|------|------|------|------|
| 前端展示 | `web/` | 3001 | 面向访客的博客站点 (Nuxt 3 SSR) |
| 后台管理 | `admin/` | 3002 | 内容管理后台 (Vue 3 SPA) |
| 后端 API | `server/` | 3000 | 业务 API 服务 (NestJS) |

### 架构图

```
┌──────────────────────┐  ┌──────────────────────┐
│   Web (Nuxt 3 SSR)   │  │ Admin (Vue 3 + EP)   │
│   访客端 · 3001       │  │  管理端 · 3002        │
└──────────┬───────────┘  └──────────┬───────────┘
           │                         │
           └────────────┬────────────┘
                        │ REST API (JWT)
                        ▼
           ┌────────────────────────┐
           │   Server (NestJS)      │
           │   API · 3000           │
           │  Swagger /api/docs     │
           └────────────┬───────────┘
                        │ Prisma ORM
                        ▼
                  ┌──────────┐
                  │  MySQL   │
                  └──────────┘
```

---

## 技术栈

### 前端展示 (`web/`)

- **框架**：Nuxt 3.21 + Vue 3.5 + TypeScript 5.3
- **样式**：TailwindCSS 3 + `@nuxtjs/color-mode` (深色模式)
- **国际化**：`@nuxtjs/i18n` (中/英双语)
- **图片**：`@nuxt/image` (AVIF/WebP 自动转换)
- **Markdown**：`marked` + `highlight.js` + `marked-highlight`
- **图标**：`lucide-vue-next`
- **渲染模式**：SSR + SWR 路由级缓存
- **PWA**：`@vite-pwa/nuxt` + Workbox（离线缓存 + 桌面安装）

### 后台管理 (`admin/`)

- **框架**：Vue 3.4 + TypeScript + Vite 5
- **UI 组件**：Element Plus 2.6
- **状态**：Pinia 2.1 + `pinia-plugin-persistedstate`
- **Markdown 编辑器**：`md-editor-v3`
- **HTTP**：Axios
- **自动导入**：`unplugin-auto-import` + `unplugin-vue-components`

### 后端 API (`server/`)

- **框架**：NestJS 10.3 + TypeScript
- **ORM**：Prisma 5.10 (MySQL)
- **认证**：`@nestjs/jwt` + `passport-jwt` + `bcryptjs`
- **限流**：`@nestjs/throttler`
- **API 文档**：`@nestjs/swagger`
- **文件上传**：`multer`
- **UA 解析**：`ua-parser-js`
- **校验**：`class-validator` + `class-transformer`

---

## 项目结构

```
技术博客/
├── web/                    # 前端展示站点 (Nuxt 3)
│   ├── pages/              # 路由页面
│   │   ├── index.vue       # 首页
│   │   ├── articles/       # 文章列表 & 详情
│   │   ├── projects.vue    # 项目展示
│   │   ├── tools.vue       # 工具导航
│   │   ├── about.vue       # 关于我
│   │   ├── contact.vue     # 联系/留言
│   │   └── login.vue       # 登录
│   ├── components/         # 组件 (App/Home/Article 等)
│   ├── composables/        # useApi / useSiteConfig / useMeteor
│   ├── layouts/            # 默认布局
│   ├── plugins/            # Nuxt 插件
│   ├── i18n/locales/       # 中英文语言包
│   ├── assets/             # 样式资源
│   ├── public/             # 静态资源
│   └── nuxt.config.ts      # Nuxt 配置 (SSR/SWR/图片/i18n)
│
├── admin/                  # 后台管理 (Vue 3 + Element Plus)
│   ├── src/
│   │   ├── views/          # 管理页面 (文章/分类/标签/项目/留言/统计 等)
│   │   ├── api/            # API 封装
│   │   ├── stores/         # Pinia
│   │   ├── router/         # 路由
│   │   └── layouts/        # 布局
│   └── vite.config.ts
│
├── server/                 # 后端 API (NestJS)
│   ├── src/
│   │   ├── main.ts         # 入口 (CORS/ValidationPipe/Swagger)
│   │   ├── app.module.ts   # 根模块
│   │   ├── config/         # 配置
│   │   ├── common/         # 拦截器/过滤器/装饰器
│   │   └── modules/        # 业务模块 (18 个)
│   │       ├── auth/       # 登录/注册/JWT
│   │       ├── site/       # 站点配置
│   │       ├── banner/     # 首页轮播
│   │       ├── article/    # 文章
│   │       ├── category/   # 分类
│   │       ├── tag/        # 标签
│   │       ├── skill/      # 技能
│   │       ├── project/    # 项目
│   │       ├── experience/ # 工作经历
│   │       ├── social/     # 社交链接
│   │       ├── comment/    # 评论
│   │       ├── message/    # 留言
│   │       ├── music/      # 音乐播放器
│   │       ├── tool/       # 工具导航
│   │       ├── ai-chat/    # AI 对话
│   │       ├── track/      # 访问统计
│   │       ├── upload/     # 文件上传
│   │       └── prisma/     # Prisma Service
│   └── prisma/
│       ├── schema.prisma   # 数据模型 (20+ 模型)
│       └── seed.ts         # 种子数据
│
├── 设计/                    # 设计稿资源
└── 项目简历.md              # 项目简历版本说明
```

---

## 功能模块

### 前台功能
- **首页**：Banner 轮播、精选文章、技能展示
- **文章系统**：Markdown 渲染、代码高亮、章节导航、点赞、分享
- **项目展示**：项目卡片、技术栈标签、Demo/GitHub/Gitee 多平台链接
- **关于页**：个人简介、技能雷达、工作经历时间轴
- **联系/留言**：留言板、社交链接
- **工具导航**：开发工具分类聚合
- **国际化**：中英文一键切换，浏览器语言自动检测
- **深色模式**：系统主题检测 + 手动切换
- **流星特效**：Canvas 实现的背景粒子动画（可配置开关）
- **SEO**：动态 `<Head>`、OpenGraph、`robots`、结构化数据
- **PWA**：手机浏览器“添加到主屏幕”，断网离线仍可阅读已缓存文章
  - Service Worker 四层缓存策略：API (NetworkFirst) / 文章页 (StaleWhileRevalidate) / 静态资源 (CacheFirst) / 图片 (CacheFirst)
  - `standalone` 模式无浏览器地址栏，iOS 适配

### 后台功能
- **仪表盘**：文章/访问/留言数据概览
- **内容管理**：文章（含 Gitee 导入）、分类、标签、项目、技能、工具
- **AI 辅助创作（Co-pilot）**：在 Markdown 编辑器中划选文本，弹出悬浮 AI 菜单
  - 💎 AI 润色 / 🔄 AI 重写 / ✏️ AI 续写 / 📐 AI 精简
  - 🏷️ 一键生成 SEO TDK（Title / Description / Keywords）
  - 原文 vs AI 结果对比预览，确认后一键替换
- **站点配置**：标题、SEO、特效开关、社交链接
- **访问统计**：PV/UV、设备/浏览器/OS 分析、路径追踪
- **消息管理**：留言审核、评论审批
- **AI 助手**：聊天记录管理

### 后端能力
- 18 个业务模块，RESTful API
- JWT 鉴权 + 请求限流（1s/100, 10s/500, 1min/1000）
- 全局响应拦截器统一 `{ code, message, data, timestamp }`
- BigInt JSON 序列化处理
- Swagger 在线 API 文档
- CORS 白名单 + 开发环境自动放行 localhost

---

## 快速开始

### 环境要求

- **Node.js** ≥ 18
- **MySQL** ≥ 8.0
- **npm** / **pnpm** / **yarn**

### 1. 克隆仓库

```bash
git clone <your-repo-url>
cd 技术博客
```

### 2. 启动后端

```bash
cd server
npm install
cp .env.example .env        # 配置 DATABASE_URL / JWT_SECRET
npm run db:generate          # 生成 Prisma Client
npm run db:push              # 同步数据库表结构
npm run db:seed              # 导入初始数据 (可选)
npm run start:dev            # 开发模式启动，端口 3000
```

启动后访问：
- API：http://localhost:3000/api
- Swagger 文档：http://localhost:3000/api/docs

### 3. 启动前端

```bash
cd web
npm install
npm run dev                  # 端口 3001
```

访问：http://localhost:3001

### 4. 启动后台

```bash
cd admin
npm install
npm run dev                  # 端口 3002
```

访问：http://localhost:3002

---

## 环境配置

### `server/.env`

```ini
# 服务
PORT=3000
NODE_ENV=development

# 数据库
DATABASE_URL="mysql://user:password@localhost:3306/tech_blog"

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS 白名单（逗号分隔）
CORS_ORIGINS=http://localhost:3001,http://localhost:3002,http://localhost:3003,https://shinegoldyao.store

# 上传目录
UPLOAD_DIR=./uploads
```

### `web/.env`

```ini
NUXT_PUBLIC_API_BASE=http://localhost:3000/api
NUXT_PUBLIC_SITE_URL=http://localhost:3001
```

### `admin/.env`

```ini
VITE_API_BASE=http://localhost:3000/api
```

---

## 开发指南

### 常用脚本

**后端 (`server/`)**

| 命令 | 说明 |
|------|------|
| `npm run start:dev` | 开发模式 (watch) |
| `npm run start:prod` | 生产模式 |
| `npm run build` | 编译 TypeScript |
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:push` | 推送 schema 到数据库 |
| `npm run db:migrate` | 创建迁移文件 |
| `npm run db:studio` | 打开 Prisma Studio |
| `npm run db:seed` | 导入种子数据 |
| `npm run lint` | ESLint 检查 |
| `npm run format` | Prettier 格式化 |

**前端 (`web/`)**

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式，端口 3001 |
| `npm run build` | 生产构建 |
| `npm run preview` | 本地预览构建产物 |
| `npm run generate` | 静态站点生成 |

**后台 (`admin/`)**

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式，端口 3002 |
| `npm run build` | 生产构建 |
| `npm run preview` | 本地预览 |

### 新增业务模块（后端）

```bash
cd server
nest g module modules/xxx
nest g controller modules/xxx
nest g service modules/xxx
```

然后在 `src/app.module.ts` 注册新模块，并在 `prisma/schema.prisma` 添加对应模型后执行 `npm run db:push`。

### 前端组合式函数

- `useApi()`：统一 API 调用
- `useSiteConfig()`：全局站点配置（基于 `useAsyncData` 缓存共享）
- `useMeteor()`：流星特效配置

---

## 部署

### 后端部署

支持 **Railway / Vercel / Docker / 传统服务器**，已配置 `railway.toml`。

```bash
cd server
npm run build
npm run start:prod
```

### 前端部署（推荐 Vercel / Cloudflare Pages）

```bash
cd web
npm run build
# 产物在 .output/
```

**路由级缓存策略**（见 `nuxt.config.ts`）：

| 路由 | 策略 |
|------|------|
| `/` | SWR 60s |
| `/articles` | SWR 60s |
| `/articles/**` | SWR 300s |
| `/projects` / `/tools` | SWR 300s |
| `/about` | SWR 600s |
| `/login` | CSR only |

### 后台部署（推荐 Vercel）

```bash
cd admin
npm run build
# 产物在 dist/，已配置 vercel.json
```

---

## 性能优化

### 前端 (web)

- **SSR + SWR**：首屏服务端渲染，路由级增量缓存，LCP < 1s
- **图片优化**：Nuxt Image 自动输出 AVIF/WebP，响应式 srcset；首屏图 `fetchpriority=high`
- **代码分割**：`lucide-vue-next`、`vue-i18n` 手动分包；`marked`/`highlight.js` 路由级懒加载
- **滚动优化**：Navbar scroll 监听使用 `passive: true` + `requestAnimationFrame` 节流 + `onUnmounted` 清理
- **埋点优化**：访问统计优先使用 `navigator.sendBeacon`，回退 `fetch({ keepalive: true })`
- **状态共享**：`useSiteConfig` 基于 `useAsyncData` 全局缓存，避免重复请求
- **资源压缩**：Nitro 开启 Gzip + Brotli
- **PWA 离线缓存**：@vite-pwa/nuxt + Workbox 四层缓存策略（NetworkFirst / StaleWhileRevalidate / CacheFirst），断网仍可阅读已缓存文章

### 后端 (server)

- Prisma 自动索引优化（`visit_log` 建立 `ip`、`createTime` 索引）
- BigInt 序列化全局处理
- 限流防护：三档限流策略
- 软删除设计（`deleteTime` 字段）

---

## API 文档

启动后端后访问 **Swagger UI**：

```
http://localhost:3000/api/docs
```

支持在线调试所有接口，包含请求/响应 Schema、JWT Bearer 认证。

### 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": 1713408000000
}
```

### 认证方式

请求头携带：

```
Authorization: Bearer <your-jwt-token>
```

---

## 数据模型

核心数据模型（详见 `server/prisma/schema.prisma`）：

| 模型 | 说明 |
|------|------|
| `User` | 用户 |
| `SiteConfig` | 站点配置（KV 结构） |
| `Banner` | 首页轮播 |
| `Article` / `Category` / `Tag` | 文章、分类、标签 |
| `SkillCategory` / `Skill` | 技能分类与技能 |
| `Project` | 项目展示 |
| `Experience` | 工作经历 |
| `Social` | 社交链接 |
| `Comment` / `Message` | 评论、留言 |
| `Music` | 音乐播放器歌单 |
| `Tool` | 工具导航 |
| `AiChat` | AI 对话记录 |
| `AiReadLog` | AI 阅读辅助日志 |
| `VisitLog` | 访问日志 |
| `ClickLog` | 点击热力图日志 |
| `RageClick` | 愤怒点击记录 |

所有业务表均含 `createTime` / `updateTime` / `deleteTime` 三个时间字段，支持软删除。

---

## 贡献 & 许可

- 个人项目，欢迎交流
- License: MIT

## 作者

**姚兴金 (ShineGoldYao)**

- 网站：[https://shinegoldyao.store](https://shinegoldyao.store)

---

> 🚀 如果这个项目对你有启发，欢迎 Star！
