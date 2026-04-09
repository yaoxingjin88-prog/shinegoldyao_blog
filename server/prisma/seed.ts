import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123456', 10);
  await prisma.adminUser.upsert({
    where: { id: 1n },
    update: {},
    create: { username: 'admin', password: hashedPassword, nickname: '管理员', status: 1 },
  });

  const siteConfigs = [
    { configKey: 'site_title', configValue: 'DevVoyage', description: '网站标题' },
    { configKey: 'site_subtitle', configValue: '架构代码，书写未来', description: '网站副标题' },
    { configKey: 'home_intro', configValue: '全栈开发者 / 开源爱好者 / 技术博主', description: '首页简介' },
    { configKey: 'avatar', configValue: '', description: '个人头像' },
    { configKey: 'seo_keywords', configValue: 'DevVoyage,技术博客,全栈开发', description: 'SEO关键词' },
    { configKey: 'seo_description', configValue: '专注于前沿技术分享与开源项目展示的个人技术博客', description: 'SEO描述' },
  ];

  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { configKey: config.configKey },
      update: {},
      create: config,
    });
  }

  // ---- 工具导航 ----
  const toolCategories = [
    {
      categoryName: '开发工具', icon: 'Code2', bgClass: 'bg-blue-100 dark:bg-blue-900/30', iconClass: 'text-blue-600 dark:text-blue-400', sort: 60,
      tools: [
        { name: 'GitHub', emoji: '🐙', description: '全球最大的代码托管与协作平台', url: 'https://github.com', sort: 60 },
        { name: 'VS Code Web', emoji: '💻', description: '在线版 Visual Studio Code 编辑器', url: 'https://vscode.dev', sort: 50 },
        { name: 'CodePen', emoji: '✏️', description: '在线前端代码编辑器与社区', url: 'https://codepen.io', sort: 40 },
        { name: 'StackBlitz', emoji: '⚡', description: '基于浏览器的全栈开发环境', url: 'https://stackblitz.com', sort: 30 },
        { name: 'Regex101', emoji: '🔍', description: '正则表达式在线测试与调试', url: 'https://regex101.com', sort: 20 },
        { name: 'JSON Formatter', emoji: '📋', description: 'JSON 数据格式化与校验工具', url: 'https://jsonformatter.org', sort: 10 },
      ],
    },
    {
      categoryName: '设计资源', icon: 'Palette', bgClass: 'bg-pink-100 dark:bg-pink-900/30', iconClass: 'text-pink-600 dark:text-pink-400', sort: 50,
      tools: [
        { name: 'Figma', emoji: '🎨', description: '强大的在线 UI/UX 协作设计工具', url: 'https://figma.com', sort: 60 },
        { name: 'Dribbble', emoji: '🏀', description: '全球设计师作品展示与灵感平台', url: 'https://dribbble.com', sort: 50 },
        { name: 'Coolors', emoji: '🌈', description: '快速配色方案生成器', url: 'https://coolors.co', sort: 40 },
        { name: 'Google Fonts', emoji: '🔤', description: '免费开源字体库', url: 'https://fonts.google.com', sort: 30 },
        { name: 'Lucide Icons', emoji: '✨', description: '精美的开源 SVG 图标库', url: 'https://lucide.dev', sort: 20 },
        { name: 'Tailwind CSS', emoji: '🌊', description: '实用优先的 CSS 框架文档', url: 'https://tailwindcss.com', sort: 10 },
      ],
    },
    {
      categoryName: '图片与媒体', icon: 'Image', bgClass: 'bg-amber-100 dark:bg-amber-900/30', iconClass: 'text-amber-600 dark:text-amber-400', sort: 40,
      tools: [
        { name: 'Unsplash', emoji: '📸', description: '高质量免费图片素材库', url: 'https://unsplash.com', sort: 60 },
        { name: 'TinyPNG', emoji: '🐼', description: 'PNG/JPEG 图片在线压缩', url: 'https://tinypng.com', sort: 50 },
        { name: 'Remove.bg', emoji: '🪄', description: 'AI 智能抠图去背景', url: 'https://www.remove.bg', sort: 40 },
        { name: 'Squoosh', emoji: '🗜️', description: 'Google 出品的图片压缩工具', url: 'https://squoosh.app', sort: 30 },
        { name: 'Carbon', emoji: '🖼️', description: '生成漂亮的代码截图', url: 'https://carbon.now.sh', sort: 20 },
        { name: 'Shots.so', emoji: '🎬', description: '快速创建精美的产品截图', url: 'https://shots.so', sort: 10 },
      ],
    },
    {
      categoryName: '学习平台', icon: 'BookOpen', bgClass: 'bg-green-100 dark:bg-green-900/30', iconClass: 'text-green-600 dark:text-green-400', sort: 30,
      tools: [
        { name: 'MDN Web Docs', emoji: '📚', description: 'Mozilla Web 技术权威文档', url: 'https://developer.mozilla.org', sort: 60 },
        { name: 'Can I Use', emoji: '✅', description: '浏览器兼容性速查', url: 'https://caniuse.com', sort: 50 },
        { name: 'LeetCode', emoji: '🧩', description: '编程算法题练习平台', url: 'https://leetcode.cn', sort: 40 },
        { name: 'DevDocs', emoji: '📖', description: '多技术栈 API 文档聚合', url: 'https://devdocs.io', sort: 30 },
        { name: 'Roadmap.sh', emoji: '🗺️', description: '开发者技术成长路线图', url: 'https://roadmap.sh', sort: 20 },
        { name: 'TypeScript 教程', emoji: '🔷', description: 'TypeScript 官方文档与教程', url: 'https://www.typescriptlang.org', sort: 10 },
      ],
    },
    {
      categoryName: '实用服务', icon: 'Globe', bgClass: 'bg-violet-100 dark:bg-violet-900/30', iconClass: 'text-violet-600 dark:text-violet-400', sort: 20,
      tools: [
        { name: 'Vercel', emoji: '▲', description: '前端项目部署与托管平台', url: 'https://vercel.com', sort: 60 },
        { name: 'Netlify', emoji: '🌐', description: 'Jamstack 网站部署平台', url: 'https://www.netlify.com', sort: 50 },
        { name: 'Cloudflare', emoji: '☁️', description: 'CDN 加速与网站安全防护', url: 'https://www.cloudflare.com', sort: 40 },
        { name: 'Supabase', emoji: '🔋', description: '开源 Firebase 替代方案', url: 'https://supabase.com', sort: 30 },
        { name: 'Excalidraw', emoji: '🎯', description: '手绘风格的在线白板工具', url: 'https://excalidraw.com', sort: 20 },
        { name: 'Notion', emoji: '📝', description: '全能型笔记与项目管理工具', url: 'https://www.notion.so', sort: 10 },
      ],
    },
    {
      categoryName: 'AI 工具', icon: 'Wrench', bgClass: 'bg-cyan-100 dark:bg-cyan-900/30', iconClass: 'text-cyan-600 dark:text-cyan-400', sort: 10,
      tools: [
        { name: 'ChatGPT', emoji: '🤖', description: 'OpenAI 出品的对话式 AI 助手', url: 'https://chat.openai.com', sort: 60 },
        { name: 'Claude', emoji: '🧠', description: 'Anthropic 打造的 AI 助手', url: 'https://claude.ai', sort: 50 },
        { name: 'Cursor', emoji: '🖱️', description: 'AI 驱动的智能代码编辑器', url: 'https://cursor.sh', sort: 40 },
        { name: 'v0.dev', emoji: '🎨', description: 'Vercel AI 驱动的 UI 生成器', url: 'https://v0.dev', sort: 30 },
        { name: 'Perplexity', emoji: '🔮', description: 'AI 搜索引擎，精准获取信息', url: 'https://www.perplexity.ai', sort: 20 },
        { name: 'Hugging Face', emoji: '🤗', description: '开源 AI 模型与数据集社区', url: 'https://huggingface.co', sort: 10 },
      ],
    },
  ];

  for (const cat of toolCategories) {
    const { tools, ...catData } = cat;
    const existing = await prisma.toolCategory.findFirst({ where: { categoryName: cat.categoryName, deleteTime: 0n } });
    let categoryId: bigint;
    if (existing) {
      categoryId = existing.id;
    } else {
      const created = await prisma.toolCategory.create({ data: catData });
      categoryId = created.id;
    }
    for (const tool of tools) {
      const existingTool = await prisma.toolItem.findFirst({ where: { categoryId, name: tool.name, deleteTime: 0n } });
      if (!existingTool) {
        await prisma.toolItem.create({ data: { ...tool, categoryId } });
      }
    }
  }

  console.log('✅ Seed data inserted successfully');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
