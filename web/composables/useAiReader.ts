/**
 * AI 辅助阅读器的全局共享开关
 * 让 ArticleAiReader 抽屉可被其他组件（如航行者 AiChat）调用打开
 */
export const useAiReaderOpen = () => useState<boolean>('ai-reader-open', () => false)
