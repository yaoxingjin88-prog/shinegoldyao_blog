import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AiArticleMeta {
  summary: string;
  keywords: string[];
  tags: string[];
  seoDescription: string;
}

export interface MindmapNode {
  title: string;
  children?: MindmapNode[];
}

export interface TermExplanation {
  term: string;
  explanation: string;
}

export interface AiReadResult {
  mindmap: MindmapNode | null;
  terms: TermExplanation[];
  summary: string;
}

/**
 * AI 内容服务：基于文章标题 + 正文，调用大模型（通义千问 qwen-turbo）
 * 生成：TL;DR 摘要 / SEO 关键词 / 推荐标签 / SEO 描述
 */
@Injectable()
export class AiContentService {
  private readonly logger = new Logger(AiContentService.name);
  private readonly apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  private readonly timeoutMs = 20000;

  constructor(private readonly configService: ConfigService) {}

  get enabled(): boolean {
    return !!this.configService.get<string>('dashscopeApiKey');
  }

  /**
   * 生成文章元信息（摘要 / 关键词 / 标签 / SEO 描述）
   * 失败时返回 null，调用方应对空值做回退处理
   */
  async generateMeta(title: string, content: string): Promise<AiArticleMeta | null> {
    const apiKey = this.configService.get<string>('dashscopeApiKey');
    if (!apiKey) {
      this.logger.warn('DASHSCOPE_API_KEY 未配置，跳过 AI 摘要/标签生成');
      return null;
    }

    // 截断超长正文，避免超出模型上下文
    const plainContent = this.stripMarkdown(content).slice(0, 6000);
    if (!plainContent.trim()) return null;

    const systemPrompt = `你是一个专业的技术博客编辑助手，擅长提炼文章要点并做 SEO 优化。
请根据用户提供的文章标题和正文，生成结构化元信息。
严格按照 JSON 格式返回，不要输出任何 Markdown 代码块包裹或额外解释文字。`;

    const userPrompt = `请根据以下技术文章，输出严格 JSON，字段如下：
- summary: 文章 TL;DR 摘要，中文，80-150 字，提炼核心观点与技术要点，避免口水话
- seoDescription: 面向搜索引擎的描述，中文，60-120 字，包含核心技术关键词
- keywords: SEO 关键词数组，3-6 个，短词或词组，按重要性排序
- tags: 推荐文章标签数组，3-6 个，优先使用常见技术栈名称（如 Vue、Nuxt、TypeScript、NestJS 等）

返回格式示例：
{"summary":"...","seoDescription":"...","keywords":["...","..."],"tags":["...","..."]}

文章标题：${title}

文章正文：
${plainContent}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        this.logger.error(`Qwen API error: ${response.status} ${text}`);
        return null;
      }

      const data: any = await response.json();
      const raw = data?.choices?.[0]?.message?.content || '';
      return this.parseResponse(raw);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        this.logger.warn('AI 生成超时');
      } else {
        this.logger.error('AI 生成失败', err);
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * 生成 AI 阅读辅助：思维导图 / 术语解释
   * @param mode 'mindmap' | 'terms' | 'all'
   */
  async generateReadAssist(
    title: string,
    content: string,
    mode: 'mindmap' | 'terms' | 'all' = 'all',
  ): Promise<AiReadResult | null> {
    const apiKey = this.configService.get<string>('dashscopeApiKey');
    if (!apiKey) return null;
    const plain = this.stripMarkdown(content).slice(0, 7000);
    if (!plain.trim()) return null;

    const wantMindmap = mode === 'mindmap' || mode === 'all';
    const wantTerms = mode === 'terms' || mode === 'all';

    const fieldSpec: string[] = [];
    if (wantMindmap) {
      fieldSpec.push(
        '- mindmap: 文章思维导图，对象结构 { title, children: [{ title, children: [...] }] }，根节点为文章主题，最多 3 层深度，每层 2-6 个节点，节点标题 ≤ 20 字',
      );
    }
    if (wantTerms) {
      fieldSpec.push(
        '- terms: 文章中出现的专业技术术语数组，每项 { term, explanation }，选取 5-10 个核心术语，解释 30-80 字，通俗易懂',
      );
    }
    fieldSpec.push('- summary: 文章 TL;DR 摘要，60-120 字');

    const systemPrompt = `你是一个专业的技术文章阅读助手，擅长拆解长文结构并解释术语。严格按 JSON 返回，不要 Markdown 包裹。`;
    const userPrompt = `请分析以下技术文章，按 JSON 格式返回以下字段：\n${fieldSpec.join('\n')}\n\n文章标题：${title}\n\n文章正文：\n${plain}`;

    const raw = await this.callJson(apiKey, systemPrompt, userPrompt);
    if (!raw) return null;

    try {
      const cleaned = raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();
      const json = JSON.parse(cleaned);
      return {
        mindmap: wantMindmap ? this.normalizeMindmap(json.mindmap, title) : null,
        terms: wantTerms ? this.normalizeTerms(json.terms) : [],
        summary: String(json.summary || '').trim(),
      };
    } catch (err) {
      this.logger.warn('AI 阅读辅助解析失败', err as any);
      return null;
    }
  }

  /**
   * AI 润色 / 重写选中文本
   * @param text 用户在编辑器中选中的文本
   * @param action 'polish' 润色 | 'rewrite' 重写
   * @param context 文章标题或上下文
   */
  async polishOrRewrite(
    text: string,
    action: 'polish' | 'rewrite',
    context?: string,
  ): Promise<string | null> {
    const apiKey = this.configService.get<string>('dashscopeApiKey');
    if (!apiKey) return null;
    const trimmed = String(text || '').trim().slice(0, 3000);
    if (!trimmed) return null;

    const instructions: Record<string, string> = {
      polish:
        '对以下文本进行润色。要求：保持原意不变，优化措辞和句式，使语句更流畅、更专业。保持技术准确性。保留原有的 Markdown 格式标记。直接输出润色后的文本，不要任何前缀说明。',
      rewrite:
        '对以下文本进行重写。要求：理解原文含义后用全新的表达方式重新撰写，使文字更生动、更有感染力，但保持技术准确性。保留原有的 Markdown 格式标记。直接输出重写后的文本，不要任何前缀说明。',
    };

    const systemPrompt = `你是一个资深技术博客写作助手，擅长将程序员写的技术文章打磨得既专业又易读。`;
    const ctx = context ? `\n\n所在文章标题：${String(context).slice(0, 200)}` : '';
    const userPrompt = `${instructions[action]}\n\n原文：\n${trimmed}${ctx}`;

    return this.callText(apiKey, systemPrompt, userPrompt);
  }

  /**
   * AI 续写：基于选中文本及上下文继续撰写
   */
  async continueWriting(text: string, context?: string): Promise<string | null> {
    const apiKey = this.configService.get<string>('dashscopeApiKey');
    if (!apiKey) return null;
    const trimmed = String(text || '').trim().slice(0, 3000);
    if (!trimmed) return null;

    const systemPrompt = `你是一个资深技术博客写作助手。用户会给你一段文本末尾，你需要自然地续写下去。要求：
1. 续写内容与原文风格一致
2. 保持技术准确性
3. 续写 100-200 字左右
4. 保持 Markdown 格式
5. 直接输出续写内容，不要任何前缀说明。`;

    const ctx = context ? `\n\n文章标题：${String(context).slice(0, 200)}` : '';
    const userPrompt = `请续写以下内容：\n\n${trimmed}${ctx}`;

    return this.callText(apiKey, systemPrompt, userPrompt);
  }

  /**
   * AI 精简：压缩文本，去除冗余
   */
  async condenseText(text: string, context?: string): Promise<string | null> {
    const apiKey = this.configService.get<string>('dashscopeApiKey');
    if (!apiKey) return null;
    const trimmed = String(text || '').trim().slice(0, 3000);
    if (!trimmed) return null;

    const systemPrompt = `你是一个资深技术博客编辑。用户会给你一段文本，你需要精简它。要求：
1. 删除冗余表达，保留核心信息
2. 保持技术准确性
3. 字数压缩至原文的 50%-70%
4. 保持 Markdown 格式
5. 直接输出精简后的文本，不要任何前缀说明。`;

    const ctx = context ? `\n\n文章标题：${String(context).slice(0, 200)}` : '';
    const userPrompt = `请精简以下文本：\n\n${trimmed}${ctx}`;

    return this.callText(apiKey, systemPrompt, userPrompt);
  }

  /** 通用文本（非 JSON）调用 */
  private async callText(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'qwen-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.5,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        this.logger.error(`Qwen API error: ${response.status}`);
        return null;
      }
      const data: any = await response.json();
      return String(data?.choices?.[0]?.message?.content || '').trim() || null;
    } catch (err: any) {
      if (err?.name === 'AbortError') this.logger.warn('AI callText 超时');
      else this.logger.error('AI callText 失败', err);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * 解释术语或选中文本
   * @param text 用户选中或点击的术语/文本
   * @param context 可选的上下文（文章标题或周围段落），帮助模型理解语境
   */
  async explainText(text: string, context?: string): Promise<string | null> {
    const apiKey = this.configService.get<string>('dashscopeApiKey');
    if (!apiKey) return null;
    const trimmed = String(text || '').trim().slice(0, 500);
    if (!trimmed) return null;

    const systemPrompt = `你是一个专业的技术讲解助手，擅长把复杂术语讲得通俗易懂。
直接输出 Markdown 格式的解释，不要有任何前置客套话（比如"好的"、"当然"）。
解释应包含：1) 简明定义 2) 核心原理或用途 3) 如果是技术名词，给一个简短示例。
控制在 200 字以内。`;

    const ctx = context ? `\n\n上下文：${String(context).slice(0, 500)}` : '';
    const userPrompt = `请解释以下内容：\n\n${trimmed}${ctx}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'qwen-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.4,
        }),
        signal: controller.signal,
      });
      if (!response.ok) return null;
      const data: any = await response.json();
      return String(data?.choices?.[0]?.message?.content || '').trim() || null;
    } catch (err: any) {
      if (err?.name === 'AbortError') this.logger.warn('AI explain 超时');
      else this.logger.error('AI explain 失败', err);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  /** 统一的 JSON 模式调用 */
  private async callJson(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        this.logger.error(`Qwen API error: ${response.status}`);
        return null;
      }
      const data: any = await response.json();
      return data?.choices?.[0]?.message?.content || null;
    } catch (err: any) {
      if (err?.name === 'AbortError') this.logger.warn('AI 调用超时');
      else this.logger.error('AI 调用失败', err);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  private normalizeMindmap(node: any, fallbackTitle: string, depth = 0): MindmapNode | null {
    if (!node || depth > 3) return null;
    const title = String(node.title || node.name || (depth === 0 ? fallbackTitle : '')).trim().slice(0, 40);
    if (!title) return null;
    const childrenRaw = Array.isArray(node.children) ? node.children : [];
    const children = childrenRaw
      .slice(0, 6)
      .map((c: any) => this.normalizeMindmap(c, '', depth + 1))
      .filter((c: MindmapNode | null): c is MindmapNode => !!c);
    return children.length ? { title, children } : { title };
  }

  private normalizeTerms(arr: any): TermExplanation[] {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((t) => ({
        term: String(t?.term || t?.name || '').trim().slice(0, 40),
        explanation: String(t?.explanation || t?.desc || t?.description || '').trim().slice(0, 300),
      }))
      .filter((t) => t.term && t.explanation)
      .slice(0, 10);
  }

  private parseResponse(raw: string): AiArticleMeta | null {
    if (!raw) return null;
    // 容错：去掉可能的 ```json ``` 包裹
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    try {
      const json = JSON.parse(cleaned);
      const summary = String(json.summary || '').trim();
      const seoDescription = String(json.seoDescription || json.description || summary).trim();
      const keywords = this.normalizeArray(json.keywords);
      const tags = this.normalizeArray(json.tags);
      if (!summary && keywords.length === 0 && tags.length === 0) return null;
      return { summary, seoDescription, keywords, tags };
    } catch (err) {
      this.logger.warn(`AI 返回解析失败：${cleaned.slice(0, 200)}`);
      return null;
    }
  }

  private normalizeArray(val: any): string[] {
    if (!val) return [];
    const arr = Array.isArray(val) ? val : String(val).split(/[,，、]/);
    return Array.from(
      new Set(
        arr
          .map((s) => String(s).trim())
          .filter((s) => s && s.length <= 30),
      ),
    ).slice(0, 8);
  }

  /** 简单去除 Markdown 语法（代码块/图片/链接等），保留可读文本 */
  private stripMarkdown(md: string): string {
    return String(md || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/^[>#*\-+]\s+/gm, '')
      .replace(/\n{2,}/g, '\n')
      .trim();
  }
}
