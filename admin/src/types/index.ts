export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface AdminUser {
  id: string
  username: string
  nickname: string
  avatar: string
}

export interface Article {
  id: string
  title: string
  slug: string
  coverUrl: string
  summary: string
  content: string
  htmlContent: string
  categoryId: string
  viewCount: number
  isTop: number
  isPublish: number
  seoKeywords: string
  seoDescription: string
  publishTime: string | null
  createTime: string
  updateTime: string
  category?: ArticleCategory
  tags?: { tag: ArticleTag }[]
}

export interface ArticleCategory {
  id: string
  categoryName: string
  slug: string
  description: string
  sort: number
  isEnable: number
}

export interface ArticleTag {
  id: string
  tagName: string
  slug: string
  themeColor: string
}

export interface Project {
  id: string
  projectName: string
  coverUrl: string
  shortDesc: string
  fullDesc: string
  techStack: string[]
  demoUrl: string
  githubUrl: string
  giteeUrl: string
  sort: number
  isShow: number
  createTime: string
}

export interface SkillCategory {
  id: string
  categoryName: string
  themeColor: string
  sort: number
  skills?: Skill[]
}

export interface Skill {
  id: string
  categoryId: string
  skillName: string
  proficiency: number
  iconUrl: string
  description: string
  sort: number
  isEnable: number
}

export interface Banner {
  id: string
  title: string
  description: string
  imageUrl: string
  linkUrl: string
  sort: number
  isEnable: number
}

export interface Message {
  id: string
  nickname: string
  email: string
  content: string
  contact: string
  ipAddress: string
  isRead: number
  createTime: string
}

export interface Experience {
  id: string
  type: number
  orgName: string
  position: string
  startDate: string
  endDate: string | null
  description: string
  sort: number
  isShow: number
}
