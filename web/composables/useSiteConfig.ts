export const useSiteConfig = () => {
  const { getSiteConfig } = useApi()
  // 使用 useAsyncData 处理异步数据，确保选项共享
  const { data } = useAsyncData(
    'site-config',
    () => getSiteConfig().catch(() => ({})),
    {
      server: true,
      default: () => ({}),
      getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
    }
  )
  return data
}
