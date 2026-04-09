export interface MeteorConfig {
  enabled: boolean
  density: number   // 1-10
  speed: number     // 1-10
  maxCount: number  // 2-30
}

const DEFAULT_CONFIG: MeteorConfig = {
  enabled: true,
  density: 5,
  speed: 5,
  maxCount: 12,
}

export function useMeteor() {
  const meteorActive = useState('meteor-active', () => true)
  const meteorConfig = useState<MeteorConfig>('meteor-config', () => ({ ...DEFAULT_CONFIG }))
  const configLoaded = useState('meteor-config-loaded', () => false)

  function toggleMeteor() {
    meteorActive.value = !meteorActive.value
  }

  // 从后端加载流星雨配置（只加载一次）
  async function loadConfig() {
    if (configLoaded.value) return
    try {
      const { getSiteConfig } = useApi()
      const data = await getSiteConfig()
      if (data) {
        const cfg = { ...DEFAULT_CONFIG }
        if (data.meteor_enabled !== undefined) cfg.enabled = data.meteor_enabled === 'true'
        if (data.meteor_density) cfg.density = Math.max(1, Math.min(10, Number(data.meteor_density) || 5))
        if (data.meteor_speed) cfg.speed = Math.max(1, Math.min(10, Number(data.meteor_speed) || 5))
        if (data.meteor_max_count) cfg.maxCount = Math.max(2, Math.min(30, Number(data.meteor_max_count) || 12))
        meteorConfig.value = cfg
        meteorActive.value = cfg.enabled
      }
      configLoaded.value = true
    } catch { /* 加载失败使用默认值 */ }
  }

  // 计算前台实际使用的参数
  const spawnInterval = computed(() => Math.round(600 - meteorConfig.value.density * 40))
  const baseSpeed = computed(() => Math.round(4 + meteorConfig.value.speed * 2.2))
  const maxMeteors = computed(() => meteorConfig.value.maxCount)

  return { meteorActive, meteorConfig, toggleMeteor, loadConfig, spawnInterval, baseSpeed, maxMeteors }
}
