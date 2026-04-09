export default defineNuxtPlugin(() => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://shinegoldyao.store/#website',
        url: 'https://shinegoldyao.store',
        name: '姚兴金的个人技术博客',
        alternateName: 'ShineGoldYao Blog',
        description: '姚兴金（ShineGoldYao）的个人技术博客，专注于全栈开发、前端工程化、后端架构与开源项目分享。',
        inLanguage: 'zh-CN',
        publisher: {
          '@id': 'https://shinegoldyao.store/#person',
        },
      },
      {
        '@type': 'Person',
        '@id': 'https://shinegoldyao.store/#person',
        name: '姚兴金',
        alternateName: 'ShineGoldYao',
        url: 'https://shinegoldyao.store',
        description: '全栈开发者，开源爱好者，技术探索者',
        sameAs: [
          'https://github.com/ShineGoldYao',
        ],
      },
    ],
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLd),
      },
    ],
  })
})
