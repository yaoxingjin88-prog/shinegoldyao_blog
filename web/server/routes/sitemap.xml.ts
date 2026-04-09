import { defineEventHandler } from 'h3'

const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://shinegoldyao.store'
const API_BASE = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api'

export default defineEventHandler(async (event) => {
  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/about', changefreq: 'monthly', priority: '0.8' },
    { loc: '/articles', changefreq: 'daily', priority: '0.9' },
    { loc: '/projects', changefreq: 'weekly', priority: '0.7' },
    { loc: '/tools', changefreq: 'weekly', priority: '0.6' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
  ]

  // 动态获取文章列表
  let articles: any[] = []
  try {
    const res = await $fetch<any>(`${API_BASE}/article`, {
      params: { page: 1, pageSize: 200 },
    })
    articles = res?.data?.list || res?.list || []
  } catch (e) {
    // 获取失败不影响静态页面
  }

  const now = new Date().toISOString().split('T')[0]

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

  // 静态页面
  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  }

  // 文章页面
  for (const article of articles) {
    const lastmod = article.updateTime || article.publishTime || article.createTime
    const date = lastmod ? new Date(lastmod).toISOString().split('T')[0] : now
    xml += `
  <url>
    <loc>${SITE_URL}/articles/${article.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  }

  xml += `
</urlset>`

  event.node.res.setHeader('Content-Type', 'application/xml')
  event.node.res.setHeader('Cache-Control', 'public, max-age=3600')
  return xml
})
