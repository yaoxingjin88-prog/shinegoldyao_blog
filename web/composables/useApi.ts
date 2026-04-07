export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  async function $api<T = any>(url: string, opts?: Record<string, any>): Promise<T> {
    const res = await $fetch<{ code: number; message: string; data: T }>(baseURL + url, {
      ...opts,
    })
    if (res.code !== 0) throw new Error(res.message)
    return res.data
  }

  return {
    getSiteConfig: () => $api<Record<string, string>>('/site/config'),
    getBanners: () => $api<any[]>('/banner'),
    getSkillCategories: () => $api<any[]>('/skill/categories'),
    getArticles: (params?: Record<string, any>) => $api<any>('/article', { params }),
    getArticleBySlug: (slug: string) => $api<any>(`/article/${slug}`),
    getCategories: () => $api<any[]>('/category'),
    getTags: () => $api<any[]>('/tag'),
    getProjects: () => $api<any[]>('/project'),
    getSocialLinks: () => $api<any[]>('/social'),
    getExperiences: () => $api<any[]>('/experience'),
    submitMessage: (data: { nickname: string; email: string; content: string; contact?: string }) =>
      $api('/message', { method: 'POST', body: data }),
    getComments: (articleId: number | string) => $api<any[]>(`/comment/article/${articleId}`),
    submitComment: (data: { articleId: number; parentId?: number; nickname: string; email: string; content: string; website?: string }) =>
      $api('/comment', { method: 'POST', body: data }),
    getMusicList: () => $api<any[]>('/music'),
  }
}
