export const useSiteConfig = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  // 使用 useAsyncData 处理异步数据，确保选项共享
  const { data } = useAsyncData(
    'site-config',
    async () => {
      try {
        // 在 SSR 环境下使用全局 $fetch，它会自动处理 baseURL
        const res = await $fetch<{ code: number; message: string; data: Record<string, string> }>(
          `${baseURL}/site/config`
        )
        if (res.code !== 0) throw new Error(res.message || '请求失败')
        return res.data
      } catch {
        return {}
      }
    },
    {
      server: true,
      default: () => ({}),
      getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static?.data?.[key],
    }
  )
  return data
}
