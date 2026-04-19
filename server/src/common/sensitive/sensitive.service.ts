import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DfaTrie, MatchHit, MatchMode } from './dfa-trie';
import { DEFAULT_SENSITIVE_WORDS } from './default-words';

/** 字段名 → 用户可读标签，便于错误提示 */
const FIELD_LABELS: Record<string, string> = {
  nickname: '昵称',
  content: '评论内容',
  website: '网站地址',
  contact: '联系方式',
  email: '邮箱',
  title: '标题',
  summary: '摘要',
};

/** 处理策略 */
export enum SensitiveStrategy {
  /** 拒绝：抛出 400 错误，附带命中词 */
  REJECT = 'reject',
  /** 过滤：将敏感词替换为 * 后放行 */
  FILTER = 'filter',
  /** 标记：不改内容，仅在日志/DB 标记 hitWords */
  MARK = 'mark',
}

/** 检测结果 */
export interface SensitiveCheckResult {
  /** 是否命中敏感词 */
  hit: boolean;
  /** 命中的敏感词列表（去重） */
  words: string[];
  /** 命中详情 */
  hits: MatchHit[];
  /** 过滤后的文本（仅 FILTER 模式有值） */
  filteredText?: string;
}

/**
 * 敏感词过滤服务（全局单例）
 * 在 AppModule 中挂载为全局，可被任意业务注入
 */
@Injectable()
export class SensitiveService implements OnModuleInit {
  private readonly logger = new Logger(SensitiveService.name);
  private trie: DfaTrie = new DfaTrie();
  /** 自定义附加词（运行时添加，admin 可管理） */
  private customWords: Set<string> = new Set();

  onModuleInit() {
    this.rebuild();
  }

  /** 重建 Trie（默认词 + 自定义词） */
  private rebuild() {
    this.trie = new DfaTrie();
    this.trie.build(DEFAULT_SENSITIVE_WORDS);
    this.trie.build([...this.customWords]);
    this.logger.log(
      `敏感词 Trie 已构建：默认 ${DEFAULT_SENSITIVE_WORDS.length} 词 + 自定义 ${this.customWords.size} 词，节点数 ${this.trie.countNodes()}`,
    );
  }

  /**
   * 检测单段文本
   */
  check(text: string): SensitiveCheckResult {
    const hits = this.trie.match(text || '', MatchMode.MAX);
    const words = [...new Set(hits.map((h) => h.word))];
    return {
      hit: hits.length > 0,
      words,
      hits,
      filteredText: hits.length ? this.trie.filter(text) : text,
    };
  }

  /**
   * 按策略处理文本
   * @returns 处理后的文本（可能被改写）；若 REJECT 则抛异常
   */
  enforce(text: string, strategy: SensitiveStrategy = SensitiveStrategy.REJECT): {
    text: string;
    result: SensitiveCheckResult;
  } {
    const result = this.check(text);
    if (!result.hit) return { text, result };

    this.logger.warn(
      `敏感词命中 [${strategy}] words=[${result.words.join(',')}] snippet="${text.slice(0, 30)}..."`,
    );

    switch (strategy) {
      case SensitiveStrategy.REJECT:
        throw new BadRequestException(
          `内容包含违规词汇：${result.words.join('、')}，请修改后重试`,
        );
      case SensitiveStrategy.FILTER:
        return { text: result.filteredText || text, result };
      case SensitiveStrategy.MARK:
      default:
        return { text, result };
    }
  }

  /**
   * 批量校验多个字段（如评论的昵称 + 内容）
   * 命中任意字段即按策略处理，返回处理后的字段映射
   */
  enforceFields<T extends Record<string, string | undefined>>(
    fields: T,
    strategy: SensitiveStrategy = SensitiveStrategy.REJECT,
  ): { fields: T; hitWords: string[] } {
    const allHits: string[] = [];
    const next: any = { ...fields };
    for (const key of Object.keys(fields)) {
      const val = fields[key];
      if (!val || typeof val !== 'string') continue;
      const result = this.check(val);
      if (result.hit) {
        allHits.push(...result.words);
        if (strategy === SensitiveStrategy.REJECT) {
          const fieldLabel = FIELD_LABELS[key] || key;
          throw new BadRequestException(
            `${fieldLabel}含有违禁词「${result.words.join('、')}」，请修改后再提交`,
          );
        }
        if (strategy === SensitiveStrategy.FILTER) {
          next[key] = result.filteredText;
        }
      }
    }
    return { fields: next, hitWords: [...new Set(allHits)] };
  }

  // ============ 运行时词库管理 ============

  addWord(word: string) {
    if (!word?.trim()) return;
    this.customWords.add(word.trim());
    this.rebuild();
  }

  addWords(words: string[]) {
    for (const w of words) if (w?.trim()) this.customWords.add(w.trim());
    this.rebuild();
  }

  removeWord(word: string) {
    this.customWords.delete(word);
    this.rebuild();
  }

  listCustomWords(): string[] {
    return [...this.customWords];
  }

  /** 统计信息（供 admin 监控页使用） */
  stats() {
    return {
      defaultCount: DEFAULT_SENSITIVE_WORDS.length,
      customCount: this.customWords.size,
      totalCount: DEFAULT_SENSITIVE_WORDS.length + this.customWords.size,
      nodeCount: this.trie.countNodes(),
    };
  }
}
