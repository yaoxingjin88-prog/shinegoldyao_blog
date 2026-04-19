export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  async function $api<T = any>(url: string, opts?: Record<string, any>): Promise<T> {
    try {
      const res = await $fetch<{ code: number; message: string; data: T }>(baseURL + url, {
        ...opts,
      })
      if (res.code !== 0) throw new Error(res.message || '请求失败')
      return res.data
    } catch (e: any) {
      // $fetch 在非 2xx 时抛出 FetchError，真正的后端提示在 e.data.message
      const backendMsg = e?.data?.message || e?.response?._data?.message
      if (backendMsg) throw new Error(backendMsg)
      throw e
    }
  }

  return {
    getSiteConfig: () => $api<Record<string, string>>('/site/config'),
    getKnowledgeGraph: () => $api<{ nodes: any[]; links: any[]; categories: { name: string }[] }>('/site/graph'),
    getBanners: () => $api<any[]>('/banner'),
    getSkillCategories: () => $api<any[]>('/skill/categories'),
    getArticles: (params?: Record<string, any>) => $api<any>('/article', { params }),
    getArticleBySlug: (slug: string) => $api<any>(`/article/${slug}`),
    likeArticle: (slug: string) => $api<{ likeCount: number }>(`/article/${slug}/like`, { method: 'POST' }),
    aiReadArticle: (slug: string, mode: 'mindmap' | 'terms' | 'all' = 'all') =>
      $api<{ mindmap: any; terms: { term: string; explanation: string }[]; summary: string; enabled: boolean }>(
        `/article/${slug}/ai-read`,
        { params: { mode } },
      ),
    aiExplainText: (text: string, context?: string) =>
      $api<{ explanation: string; enabled: boolean }>('/article/ai-explain', {
        method: 'POST',
        body: { text, context },
      }),
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
    getTools: () => $api<any[]>('/tool'),
  }
}
