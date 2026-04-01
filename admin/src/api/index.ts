import request from './request'
import type { Article, ArticleCategory, ArticleTag, Banner, Experience, Message, Project, Skill, SkillCategory } from '../types'

export const authApi = {
  login: (data: { username: string; password: string }) => request.post<any, { accessToken: string; refreshToken: string }>('/auth/login', data),
}

export const siteApi = {
  getConfig: () => request.get<any, Record<string, string>>('/site/config'),
  updateConfig: (configs: { key: string; value: string }[]) => request.put('/site/config', { configs }),
}

export const bannerApi = {
  list: () => request.get<any, Banner[]>('/banner/admin'),
  create: (data: Partial<Banner>) => request.post('/banner', data),
  update: (id: string, data: Partial<Banner>) => request.put(`/banner/${id}`, data),
  remove: (id: string) => request.delete(`/banner/${id}`),
}

export const categoryApi = {
  list: () => request.get<any, ArticleCategory[]>('/category/admin'),
  create: (data: Partial<ArticleCategory>) => request.post('/category', data),
  update: (id: string, data: Partial<ArticleCategory>) => request.put(`/category/${id}`, data),
  remove: (id: string) => request.delete(`/category/${id}`),
}

export const tagApi = {
  list: () => request.get<any, ArticleTag[]>('/tag'),
  create: (data: Partial<ArticleTag>) => request.post('/tag', data),
  update: (id: string, data: Partial<ArticleTag>) => request.put(`/tag/${id}`, data),
  remove: (id: string) => request.delete(`/tag/${id}`),
}

export const articleApi = {
  list: (params?: Record<string, any>) => request.get<any, any>('/article/admin', { params }),
  create: (data: Partial<Article>) => request.post('/article', data),
  update: (id: string, data: Partial<Article>) => request.put(`/article/${id}`, data),
  remove: (id: string) => request.delete(`/article/${id}`),
  getBySlug: (slug: string) => request.get<any, Article>(`/article/${slug}`),
}

export const skillApi = {
  categories: () => request.get<any, SkillCategory[]>('/skill/categories'),
  createCategory: (data: Partial<SkillCategory>) => request.post('/skill/category', data),
  updateCategory: (id: string, data: Partial<SkillCategory>) => request.put(`/skill/category/${id}`, data),
  removeCategory: (id: string) => request.delete(`/skill/category/${id}`),
  createSkill: (data: Partial<Skill>) => request.post('/skill', data),
  updateSkill: (id: string, data: Partial<Skill>) => request.put(`/skill/${id}`, data),
  removeSkill: (id: string) => request.delete(`/skill/${id}`),
}

export const projectApi = {
  list: () => request.get<any, Project[]>('/project/admin'),
  create: (data: Partial<Project>) => request.post('/project', data),
  update: (id: string, data: Partial<Project>) => request.put(`/project/${id}`, data),
  remove: (id: string) => request.delete(`/project/${id}`),
}

export const messageApi = {
  list: (params?: Record<string, any>) => request.get<any, any>('/message', { params }),
  markRead: (id: string) => request.patch(`/message/${id}/read`),
  remove: (id: string) => request.delete(`/message/${id}`),
}

export const experienceApi = {
  list: () => request.get<any, Experience[]>('/experience/admin'),
  create: (data: Partial<Experience>) => request.post('/experience', data),
  update: (id: string, data: Partial<Experience>) => request.put(`/experience/${id}`, data),
  remove: (id: string) => request.delete(`/experience/${id}`),
}

export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<any, { url: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
