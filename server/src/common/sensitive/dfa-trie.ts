/**
 * ============================================================
 *  DFA（Deterministic Finite Automaton）敏感词过滤核心算法
 *  基于 Trie（字典树）实现 —— 时间复杂度 O(n)，n 为文本长度
 * ============================================================
 *
 *  原理：
 *   1. 预处理阶段：将所有敏感词构建成一棵 Trie 树
 *      每个字符对应一个节点；词尾节点标记 isEnd=true
 *   2. 匹配阶段：沿文本单向遍历，遇到字符即在 Trie 中下潜
 *      一旦路径命中 isEnd 节点即视为匹配成功
 *   3. 时间复杂度：
 *      构建 O(∑L)（L 为每个敏感词长度）
 *      匹配 O(n·k) 其中 k 为匹配层数，实际接近 O(n)
 *   4. 空间复杂度：O(节点数 × 26) —— 这里使用 Map 存储子节点，节省内存
 *
 *  支持特性：
 *   - 大小写无关（构建 / 匹配时统一转小写）
 *   - 干扰字符过滤（空格、标点、中英文符号等不阻断匹配）
 *   - 最小匹配 / 最大匹配 两种模式
 * ============================================================
 */

/** Trie 树节点 */
export class TrieNode {
  /** 子节点映射：字符 -> 节点 */
  public readonly children: Map<string, TrieNode> = new Map();
  /** 是否为某个敏感词的终结节点 */
  public isEnd = false;
  /** 在终结节点上保存原始词，便于返回命中词列表 */
  public word: string | null = null;
}

/** 敏感词命中结果 */
export interface MatchHit {
  /** 命中的敏感词 */
  word: string;
  /** 起始下标 */
  start: number;
  /** 结束下标（不含） */
  end: number;
}

/** 匹配模式 */
export enum MatchMode {
  /** 最小匹配：命中最短敏感词即停止，适合性能敏感场景 */
  MIN = 'min',
  /** 最大匹配：尽可能匹配最长敏感词，适合精准过滤 */
  MAX = 'max',
}

export class DfaTrie {
  private readonly root = new TrieNode();
  /** 干扰字符集合（这些字符在匹配时会被跳过） */
  private readonly skipChars: Set<string>;

  constructor(skipChars: string[] = [' ', '\t', '\n', '*', '-', '_', '.', ',', '，', '。', '~']) {
    this.skipChars = new Set(skipChars);
  }

  /**
   * 批量构建 Trie
   * @param words 敏感词列表
   */
  build(words: string[]): void {
    for (const word of words) this.addWord(word);
  }

  /**
   * 添加单个敏感词
   */
  addWord(word: string): void {
    if (!word) return;
    const normalized = word.toLowerCase();
    let node = this.root;
    for (const ch of normalized) {
      let child = node.children.get(ch);
      if (!child) {
        child = new TrieNode();
        node.children.set(ch, child);
      }
      node = child;
    }
    node.isEnd = true;
    node.word = normalized;
  }

  /**
   * 扫描文本，返回所有命中
   * @param text 待检测文本
   * @param mode 匹配模式
   */
  match(text: string, mode: MatchMode = MatchMode.MAX): MatchHit[] {
    const hits: MatchHit[] = [];
    if (!text) return hits;
    const src = text.toLowerCase();
    const len = src.length;

    for (let i = 0; i < len; i++) {
      // 跳过干扰字符起始
      if (this.skipChars.has(src[i])) continue;

      let node: TrieNode | undefined = this.root;
      let lastHit: MatchHit | null = null;
      let j = i;

      while (j < len && node) {
        const ch = src[j];
        // 干扰字符：在匹配过程中忽略（例如 "傻*瓜" 仍能命中 "傻瓜"）
        if (this.skipChars.has(ch)) {
          j++;
          continue;
        }
        const next: TrieNode | undefined = node.children.get(ch);
        if (!next) break;
        node = next;
        if (node.isEnd && node.word) {
          lastHit = { word: node.word, start: i, end: j + 1 };
          // 最小匹配：命中即终止；最大匹配：继续向后看能不能匹配更长的
          if (mode === MatchMode.MIN) break;
        }
        j++;
      }

      if (lastHit) {
        hits.push(lastHit);
        // 跳过已匹配区间，避免重叠（如 "傻瓜" 和 "瓜" 都是敏感词时只返回外层）
        i = lastHit.end - 1;
      }
    }
    return hits;
  }

  /**
   * 检测文本是否含敏感词（惰性：命中第一个即返回）
   */
  has(text: string): boolean {
    if (!text) return false;
    const src = text.toLowerCase();
    const len = src.length;
    for (let i = 0; i < len; i++) {
      if (this.skipChars.has(src[i])) continue;
      let node: TrieNode | undefined = this.root;
      let j = i;
      while (j < len && node) {
        const ch = src[j];
        if (this.skipChars.has(ch)) {
          j++;
          continue;
        }
        const next: TrieNode | undefined = node.children.get(ch);
        if (!next) break;
        node = next;
        if (node.isEnd) return true;
        j++;
      }
    }
    return false;
  }

  /**
   * 将文本中的敏感词替换为指定字符（默认 *）
   */
  filter(text: string, replacement = '*'): string {
    const hits = this.match(text, MatchMode.MAX);
    if (!hits.length) return text;
    const chars = [...text];
    for (const hit of hits) {
      for (let k = hit.start; k < hit.end; k++) {
        // 干扰字符保持原样，只替换实际字符
        if (!this.skipChars.has(chars[k]?.toLowerCase())) {
          chars[k] = replacement;
        }
      }
    }
    return chars.join('');
  }

  /** 统计 Trie 节点总数（用于监控） */
  countNodes(): number {
    let count = 0;
    const stack: TrieNode[] = [this.root];
    while (stack.length) {
      const n = stack.pop()!;
      count++;
      for (const child of n.children.values()) stack.push(child);
    }
    return count;
  }
}
