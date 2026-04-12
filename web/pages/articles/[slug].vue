<template>
  <div class="pt-24 pb-16">
    <article v-if="article" class="max-w-4xl mx-auto px-6">
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <span v-if="article.category" class="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{{ article.category.categoryName }}</span>
          <span v-for="t in article.tags" :key="t.tagId" class="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300" :style="t.tag?.themeColor ? { background: t.tag.themeColor + '20', color: t.tag.themeColor } : {}">{{ t.tag?.tagName }}</span>
        </div>
        <h1 class="text-4xl font-bold mb-4">{{ article.title }}</h1>
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{{ formatDate(article.publishTime || article.createTime) }}</span>
          <span class="flex items-center gap-1"><Eye class="w-4 h-4" /> {{ article.viewCount }} {{ $t('articles.reading') }}</span>
          <span class="hidden md:block text-gray-200 dark:text-gray-700">|</span>
          <ArticleShareBar
            :title="article.title"
            :url="`https://shinegoldyao.store/articles/${article.slug}`"
            :summary="article.summary || article.seoDescription || ''"
            :platforms="sharePlatforms"
          />
        </div>
      </div>

      <div v-if="article.coverUrl" class="mb-8 rounded-2xl overflow-hidden">
        <img :src="article.coverUrl" :alt="article.title" class="w-full max-h-96 object-cover" loading="lazy" decoding="async" />
      </div>

      <!-- 章节分页模式 -->
      <template v-if="chapters.length > 1">
        <!-- 目录导航 -->
        <div class="mb-10 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen class="w-5 h-5 text-blue-500" />
            {{ $t('articles.chapter') }}
            <span class="text-sm font-normal text-gray-400">({{ chapters.length }})</span>
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              v-for="(ch, i) in chapters"
              :key="i"
              class="text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
              :class="currentChapter === i
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'"
              @click="currentChapter = i; scrollToContent()"
            >
              <span class="mr-2 text-xs opacity-60">{{ i + 1 }}.</span>{{ ch.title }}
            </button>
          </div>
        </div>

        <!-- 当前章节内容 -->
        <div ref="chapterRef" class="mb-6 flex items-center justify-between">
          <span class="text-sm text-gray-400">{{ currentChapter + 1 }} / {{ chapters.length }}</span>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ chapters[currentChapter].title }}</h2>
        </div>
        <div class="prose prose-lg dark:prose-invert max-w-none article-content" v-html="chapters[currentChapter].html"></div>

        <!-- 上下章节导航 -->
        <div class="mt-12 flex items-center justify-between gap-4">
          <button
            v-if="currentChapter > 0"
            class="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            @click="currentChapter--; scrollToContent()"
          >
            <ChevronLeft class="w-4 h-4" />
            {{ chapters[currentChapter - 1].title }}
          </button>
          <div v-else></div>
          <button
            v-if="currentChapter < chapters.length - 1"
            class="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium"
            @click="currentChapter++; scrollToContent()"
          >
            {{ chapters[currentChapter + 1].title }}
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </template>

      <!-- 短文章不分页 -->
      <div v-else class="prose prose-lg dark:prose-invert max-w-none article-content" v-html="renderedContent"></div>

      <!-- 点赞区域 -->
      <div class="mt-16 flex flex-col items-center gap-3">
        <button
          @click="handleLike"
          :disabled="hasLiked"
          class="group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
          :class="hasLiked
            ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-500 cursor-default'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-500 hover:scale-110 active:scale-95'"
        >
          <svg
            class="w-7 h-7 transition-transform duration-300"
            :class="likeAnimating ? 'scale-125' : ''"
            viewBox="0 0 24 24"
            :fill="hasLiked ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span
            v-if="likeAnimating"
            class="absolute -top-1 left-1/2 -translate-x-1/2 text-pink-500 text-sm font-bold animate-float-up pointer-events-none"
          >+1</span>
        </button>
        <span class="text-sm font-medium" :class="hasLiked ? 'text-pink-500' : 'text-gray-400'">
          {{ hasLiked ? $t('articles.liked') : $t('articles.likePrompt') }}
        </span>
        <span class="text-xs text-gray-400">{{ likeCount }} {{ $t('articles.likes') }}</span>
      </div>

      <!-- 评论区 -->
      <section class="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
        <h2 class="text-2xl font-bold mb-8 flex items-center gap-2">
          <MessageCircle class="w-6 h-6" />
          {{ $t('articles.commentSection') }} <span class="text-base font-normal text-gray-400">({{ comments.length }})</span>
        </h2>

        <!-- 发表评论表单 -->
        <div class="rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 mb-10">
          <h3 class="text-lg font-semibold mb-4">{{ replyTo ? `${$t('articles.reply')} @${replyTo.nickname}` : $t('articles.submit') }}</h3>
          <div v-if="replyTo" class="mb-3">
            <button class="text-sm text-gray-500 hover:text-red-500 transition-colors" @click="replyTo = null">{{ $t('articles.cancelReply') }}</button>
          </div>
          <form class="space-y-4" @submit.prevent="handleSubmitComment">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input v-model="commentForm.nickname" type="text" :placeholder="$t('articles.nickname') + ' *'" required class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              <input v-model="commentForm.email" type="email" :placeholder="$t('articles.email') + ' *'" required class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <input v-model="commentForm.website" type="url" :placeholder="$t('articles.website')" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            <textarea v-model="commentForm.content" rows="4" :placeholder="$t('articles.commentPlaceholder')" required class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"></textarea>
            <div class="flex items-center justify-between">
              <p class="text-xs text-gray-400">{{ $t('articles.markdownHint') }}</p>
              <button type="submit" :disabled="commentLoading" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-full transition-colors flex items-center gap-2">
                <Send class="w-4 h-4" />
                {{ commentLoading ? $t('articles.submitting') : $t('articles.submit') }}
              </button>
            </div>
            <p v-if="commentSuccess" class="text-sm text-green-600">{{ $t('articles.commentSuccess') }}</p>
            <p v-if="commentError" class="text-sm text-red-500">{{ commentError }}</p>
          </form>
        </div>

        <!-- 评论列表 -->
        <div v-if="comments.length" class="space-y-6">
          <div v-for="comment in topLevelComments" :key="comment.id" class="space-y-4">
            <div class="flex gap-4">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {{ comment.nickname.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-sm">{{ comment.nickname }}</span>
                  <span class="text-xs text-gray-400">{{ formatDate(comment.createTime) }}</span>
                </div>
                <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
                <button class="mt-2 text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" @click="replyTo = comment">{{ $t('articles.reply') }}</button>
              </div>
            </div>
            <!-- 子评论 -->
            <div v-for="reply in getReplies(comment.id)" :key="reply.id" class="ml-14 flex gap-4">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {{ reply.nickname.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-sm">{{ reply.nickname }}</span>
                  <span class="text-xs text-gray-400">{{ formatDate(reply.createTime) }}</span>
                </div>
                <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{{ reply.content }}</p>
                <button class="mt-2 text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" @click="replyTo = reply">{{ $t('articles.reply') }}</button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-10 text-gray-400 text-sm">{{ $t('articles.noComments') }}</div>
      </section>
    </article>

    <!-- 加载骨架屏 -->
    <div v-else class="max-w-4xl mx-auto px-6 pt-8 animate-pulse">
      <div class="flex gap-3 mb-4">
        <div class="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
        <div class="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
      </div>
      <div class="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
      <div class="h-5 w-1/2 bg-gray-200 dark:bg-gray-800 rounded mb-8"></div>
      <div class="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-8"></div>
      <div class="space-y-3">
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, MessageCircle, Send, BookOpen, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import sql from 'highlight.js/lib/languages/sql'
import markdown from 'highlight.js/lib/languages/markdown'
import yaml from 'highlight.js/lib/languages/yaml'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import nginx from 'highlight.js/lib/languages/nginx'
import scss from 'highlight.js/lib/languages/scss'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('nginx', nginx)
hljs.registerLanguage('scss', scss)

const markedInstance = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value
      }
      return hljs.highlightAuto(code).value
    },
  }),
  { breaks: true, gfm: true }
)

const { t, locale } = useI18n()
const route = useRoute()
const { getArticleBySlug, getComments, submitComment, likeArticle, getSiteConfig } = useApi()
const replyTo = ref<any>(null)
const commentLoading = ref(false)
const commentSuccess = ref(false)
const commentError = ref('')
const commentForm = reactive({ nickname: '', email: '', content: '', website: '' })

const slug = route.params.slug as string

const [{ data: articleData }, { data: siteConfig }] = await Promise.all([
  useAsyncData(`article-${slug}`, () => getArticleBySlug(slug).catch(() => null), {
    lazy: true,
    getCachedData: (key: any, nuxtApp: any) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
  }),
  useAsyncData('site-config', () => getSiteConfig().catch(() => ({})), {
    lazy: true,
    getCachedData: (key: any, nuxtApp: any) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
  }),
])
const article = computed(() => articleData.value)
const sharePlatforms = computed(() => {
  const val = siteConfig.value?.share_platforms
  return val ? val.split(',').filter(Boolean) : ['wechat', 'weibo', 'twitter', 'copy']
})

const { data: commentsData } = await useAsyncData(`comments-${slug}`, async () => {
  if (!articleData.value) return []
  return getComments(articleData.value.id).catch(() => [])
}, {
  lazy: true,
  getCachedData: (key: any, nuxtApp: any) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})
const comments = ref<any[]>(commentsData.value || [])
watch(commentsData, (v) => { comments.value = v || [] })

const renderedContent = computed(() => {
  if (!article.value) return ''
  if (article.value.htmlContent) return article.value.htmlContent
  return markedInstance.parse(article.value.content || '') as string
})

const currentChapter = ref(0)

const chapters = computed(() => {
  if (!article.value) return []
  const content = article.value.content || ''
  // 按 ## 标题分割章节
  const parts = content.split(/^(## .+)$/m)
  if (parts.length <= 1) return []

  const result: { title: string; html: string }[] = []
  // 如果 ## 前有内容（前言），也包含进来
  let i = 0
  if (parts[0].trim()) {
    result.push({ title: t('articles.preface'), html: markedInstance.parse(parts[0]) as string })
    i = 1
  } else {
    i = 1
  }

  for (; i < parts.length; i++) {
    if (parts[i].startsWith('## ')) {
      const title = parts[i].replace(/^## /, '').trim()
      const body = (parts[i + 1] || '').trim()
      result.push({ title, html: markedInstance.parse(parts[i] + '\n' + body) as string })
      i++
    }
  }

  return result
})

const chapterRef = ref<HTMLElement | null>(null)

function scrollToContent() {
  nextTick(() => {
    if (chapterRef.value) {
      chapterRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

const topLevelComments = computed(() => comments.value.filter((c: any) => !c.parentId || c.parentId === '0' || c.parentId === 0))
function getReplies(parentId: any) {
  return comments.value.filter((c: any) => String(c.parentId) === String(parentId))
}

async function handleSubmitComment() {
  if (!article.value) return
  commentLoading.value = true
  commentSuccess.value = false
  commentError.value = ''
  try {
    await submitComment({
      articleId: Number(article.value.id),
      parentId: replyTo.value ? Number(replyTo.value.id) : undefined,
      nickname: commentForm.nickname,
      email: commentForm.email,
      content: commentForm.content,
      website: commentForm.website || undefined,
    })
    commentSuccess.value = true
    commentForm.content = ''
    replyTo.value = null
    comments.value = await getComments(articleData.value.id) || []
  } catch (e: any) {
    commentError.value = e.message || t('articles.commentError')
  } finally {
    commentLoading.value = false
  }
}

const likeCount = ref(article.value?.likeCount || 0)
const hasLiked = ref(false)
const likeAnimating = ref(false)

onMounted(() => {
  const liked = localStorage.getItem(`article-liked-${slug}`)
  if (liked) hasLiked.value = true
})

async function handleLike() {
  if (hasLiked.value) return
  try {
    const res = await likeArticle(slug)
    likeCount.value = res.likeCount
    hasLiked.value = true
    likeAnimating.value = true
    localStorage.setItem(`article-liked-${slug}`, '1')
    setTimeout(() => { likeAnimating.value = false }, 600)
  } catch {}
}

function formatDate(d: string) {
  if (!d) return ''
  const loc = locale.value === 'zh' ? 'zh-CN' : 'en-US'
  return new Date(d).toLocaleDateString(loc, { year: 'numeric', month: 'long', day: 'numeric' })
}

useHead({
  title: article.value ? `${article.value.title} - ${t('seo.articleSuffix')}` : `${t('seo.article')} - ${t('seo.articleSuffix')}`,
  meta: [
    { name: 'description', content: article.value?.seoDescription || article.value?.summary || '' },
    { name: 'keywords', content: (article.value?.seoKeywords ? article.value.seoKeywords + ',' : '') + t('seo.defaultKeywords') },
    { property: 'og:title', content: article.value?.title || t('seo.article') },
    { property: 'og:description', content: article.value?.seoDescription || article.value?.summary || '' },
    { property: 'og:url', content: `https://shinegoldyao.store/articles/${article.value?.slug || ''}` },
    { property: 'og:type', content: 'article' },
    { property: 'og:image', content: article.value?.coverUrl || '' },
    { property: 'article:author', content: 'ShineGoldYao' },
  ],
  link: [{ rel: 'canonical', href: `https://shinegoldyao.store/articles/${article.value?.slug || ''}` }],
})
</script>

<style>
.article-content {
  line-height: 1.8;
  font-size: 16px;
  color: #374151;
}
.dark .article-content {
  color: #d1d5db;
}

.article-content h1,
.article-content h2,
.article-content h3,
.article-content h4,
.article-content h5,
.article-content h6 {
  margin-top: 1.8em;
  margin-bottom: 0.6em;
  font-weight: 700;
  line-height: 1.3;
  color: #111827;
}
.dark .article-content h1,
.dark .article-content h2,
.dark .article-content h3,
.dark .article-content h4,
.dark .article-content h5,
.dark .article-content h6 {
  color: #f3f4f6;
}

.article-content h1 { font-size: 2em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
.article-content h2 { font-size: 1.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.25em; }
.article-content h3 { font-size: 1.25em; }
.dark .article-content h1,
.dark .article-content h2 { border-color: #374151; }

.article-content p {
  margin: 1em 0;
}

.article-content a {
  color: #2563eb;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
.article-content a:hover {
  border-bottom-color: #2563eb;
}
.dark .article-content a { color: #60a5fa; }
.dark .article-content a:hover { border-bottom-color: #60a5fa; }

.article-content blockquote {
  margin: 1.5em 0;
  padding: 0.8em 1.2em;
  border-left: 4px solid #3b82f6;
  background: #f0f7ff;
  border-radius: 0 8px 8px 0;
  color: #4b5563;
}
.dark .article-content blockquote {
  background: rgba(59, 130, 246, 0.1);
  color: #9ca3af;
}

.article-content code:not(pre code) {
  padding: 0.15em 0.4em;
  font-size: 0.875em;
  background: #f3f4f6;
  border-radius: 4px;
  color: #ef4444;
  font-family: 'Fira Code', Consolas, monospace;
}
.dark .article-content code:not(pre code) {
  background: #1f2937;
  color: #f87171;
}

.article-content pre {
  margin: 1.5em 0;
  padding: 1.2em;
  border-radius: 12px;
  overflow-x: auto;
  font-size: 0.875em;
  line-height: 1.6;
  background: #f6f8fa !important;
  border: 1px solid #e5e7eb;
  color: #24292e;
}
.dark .article-content pre {
  background: #1e293b !important;
  border-color: #334155;
  color: #e2e8f0;
}

.article-content pre code {
  background: none;
  color: inherit;
  padding: 0;
  font-size: inherit;
  font-family: 'Fira Code', Consolas, monospace;
}

/* highlight.js light mode token colors */
.article-content .hljs-keyword { color: #d73a49; }
.article-content .hljs-string { color: #032f62; }
.article-content .hljs-comment { color: #6a737d; }
.article-content .hljs-function { color: #6f42c1; }
.article-content .hljs-number { color: #005cc5; }
.article-content .hljs-title { color: #6f42c1; }
.article-content .hljs-built_in { color: #e36209; }
.article-content .hljs-attr { color: #005cc5; }
.article-content .hljs-selector-class,
.article-content .hljs-selector-id,
.article-content .hljs-selector-tag { color: #22863a; }
.article-content .hljs-property { color: #005cc5; }
.article-content .hljs-tag { color: #22863a; }
.article-content .hljs-name { color: #22863a; }
.article-content .hljs-attribute { color: #6f42c1; }
.article-content .hljs-variable { color: #e36209; }
.article-content .hljs-type { color: #d73a49; }

/* highlight.js dark mode token colors */
.dark .article-content .hljs-keyword { color: #ff7b72; }
.dark .article-content .hljs-string { color: #a5d6ff; }
.dark .article-content .hljs-comment { color: #8b949e; }
.dark .article-content .hljs-function { color: #d2a8ff; }
.dark .article-content .hljs-number { color: #79c0ff; }
.dark .article-content .hljs-title { color: #d2a8ff; }
.dark .article-content .hljs-built_in { color: #ffa657; }
.dark .article-content .hljs-attr { color: #79c0ff; }
.dark .article-content .hljs-selector-class,
.dark .article-content .hljs-selector-id,
.dark .article-content .hljs-selector-tag { color: #7ee787; }
.dark .article-content .hljs-property { color: #79c0ff; }
.dark .article-content .hljs-tag { color: #7ee787; }
.dark .article-content .hljs-name { color: #7ee787; }
.dark .article-content .hljs-attribute { color: #d2a8ff; }
.dark .article-content .hljs-variable { color: #ffa657; }
.dark .article-content .hljs-type { color: #ff7b72; }

.article-content ul,
.article-content ol {
  margin: 1em 0;
  padding-left: 2em;
}
.article-content li {
  margin: 0.4em 0;
}
.article-content ul li::marker {
  color: #3b82f6;
}
.article-content ol li::marker {
  color: #3b82f6;
  font-weight: 600;
}

.article-content table {
  width: 100%;
  margin: 1.5em 0;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
}
.article-content th,
.article-content td {
  padding: 0.75em 1em;
  border: 1px solid #e5e7eb;
  text-align: left;
}
.article-content th {
  background: #f9fafb;
  font-weight: 600;
}
.dark .article-content th { background: #1f2937; }
.dark .article-content th,
.dark .article-content td { border-color: #374151; }

.article-content img {
  max-width: 100%;
  border-radius: 12px;
  margin: 1.5em auto;
  display: block;
}

.article-content hr {
  margin: 2em 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}
.dark .article-content hr { border-color: #374151; }

.article-content strong { color: #111827; font-weight: 600; }
.dark .article-content strong { color: #f9fafb; }

@keyframes float-up {
  0% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-28px); }
}
.animate-float-up {
  animation: float-up 0.6s ease-out forwards;
}
</style>
