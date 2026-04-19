import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiContentService } from './ai-content.service';
import { EventsService } from '../events/events.service';
import { AiGenerateDto, CreateArticleDto, QueryArticleDto, UpdateArticleDto } from './dto/article.dto';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    private prisma: PrismaService,
    private aiContent: AiContentService,
    private events: EventsService,
  ) {}

  /** AI 预览：根据标题 + 正文生成摘要/关键词/推荐标签（不落库） */
  async aiGenerate(dto: AiGenerateDto) {
    const meta = await this.aiContent.generateMeta(dto.title, dto.content);
    if (!meta) {
      return { summary: '', seoDescription: '', keywords: [], tags: [], matchedTagIds: [] as string[] };
    }
    const matchedTagIds = await this.matchTagIds(meta.tags, false);
    return { ...meta, matchedTagIds };
  }

  /** AI 解释术语或选中文本 */
  async aiExplain(text: string, context?: string, ip = '', userAgent = '') {
    // 异步记录日志（不阻塞）
    this.prisma.aiReadLog.create({
      data: {
        ip,
        userAgent: (userAgent || '').substring(0, 500),
        actionType: 'explain',
        articleSlug: '',
        articleTitle: (context || '').substring(0, 200),
        selectedText: (text || '').substring(0, 500),
      },
    }).catch((err) => this.logger.warn('记录 AI explain 日志失败', err));

    if (!this.aiContent.enabled) return { explanation: '', enabled: false };
    const explanation = await this.aiContent.explainText(text, context);
    return { explanation: explanation || '', enabled: true };
  }

  /**
   * AI 辅助阅读：根据 slug 读取文章内容，返回思维导图 / 术语解释 / 摘要
   */
  async aiRead(slug: string, mode: 'mindmap' | 'terms' | 'all' = 'all', ip = '', userAgent = '') {
    const article = await this.prisma.article.findFirst({
      where: { slug, deleteTime: 0n, isPublish: 1 },
      select: { title: true, content: true },
    });
    if (!article) throw new NotFoundException('文章不存在');

    // 异步记录日志
    this.prisma.aiReadLog.create({
      data: {
        ip,
        userAgent: (userAgent || '').substring(0, 500),
        actionType: 'read',
        articleSlug: slug,
        articleTitle: article.title,
        selectedText: mode,
      },
    }).catch((err) => this.logger.warn('记录 AI read 日志失败', err));

    if (!this.aiContent.enabled) {
      return { mindmap: null, terms: [], summary: '', enabled: false };
    }
    const result = await this.aiContent.generateReadAssist(article.title, article.content, mode);
    return {
      mindmap: result?.mindmap || null,
      terms: result?.terms || [],
      summary: result?.summary || '',
      enabled: true,
    };
  }

  /** 管理端：查询 AI 辅助阅读日志 */
  async aiLogs(query: { page?: number; pageSize?: number; actionType?: string }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const where: any = {};
    if (query.actionType === 'read' || query.actionType === 'explain') {
      where.actionType = query.actionType;
    }
    const [list, total] = await Promise.all([
      this.prisma.aiReadLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createTime: 'desc' },
      }),
      this.prisma.aiReadLog.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  async findAll(query: QueryArticleDto) {
    const { page = 1, pageSize = 10, categoryId, tagId, keyword, isTop, isPublish } = query;
    const skip = (page - 1) * pageSize;

    const where: any = { deleteTime: 0n };
    if (isPublish !== undefined) where.isPublish = isPublish;
    else where.isPublish = 1;
    if (categoryId) where.categoryId = BigInt(categoryId);
    if (isTop !== undefined) where.isTop = isTop;
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { summary: { contains: keyword } },
      ];
    }
    if (tagId) {
      where.tags = { some: { tagId: BigInt(tagId), tag: { deleteTime: 0n } } };
    }

    const [list, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ isTop: 'desc' }, { publishTime: 'desc' }, { createTime: 'desc' }],
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return { list: list.map(this.serialize), total, page, pageSize };
  }

  async findAllAdmin(query: QueryArticleDto) {
    const { page = 1, pageSize = 10, categoryId, tagId, keyword, isTop, isPublish } = query;
    const skip = (page - 1) * pageSize;

    const where: any = { deleteTime: 0n };
    if (isPublish !== undefined) where.isPublish = isPublish;
    if (categoryId) where.categoryId = BigInt(categoryId);
    if (isTop !== undefined) where.isTop = isTop;
    if (keyword) {
      where.OR = [{ title: { contains: keyword } }, { summary: { contains: keyword } }];
    }
    if (tagId) {
      where.tags = { some: { tagId: BigInt(tagId) } };
    }

    const [list, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ createTime: 'desc' }],
        include: { category: true, tags: { include: { tag: true } } },
      }),
      this.prisma.article.count({ where }),
    ]);
    return { list: list.map(this.serialize), total, page, pageSize };
  }

  async findById(id: number) {
    const article = await this.prisma.article.findFirst({
      where: { id: BigInt(id), deleteTime: 0n },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!article) throw new NotFoundException('文章不存在');
    return this.serialize(article);
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: { slug, deleteTime: 0n, isPublish: 1 },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!article) throw new NotFoundException('文章不存在');
    await this.prisma.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } });
    return this.serialize(article);
  }

  async likeBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: { slug, deleteTime: 0n, isPublish: 1 },
    });
    if (!article) throw new NotFoundException('文章不存在');
    await this.prisma.article.update({
      where: { id: article.id },
      data: { likeCount: { increment: 1 } },
    });
    const newLikeCount = article.likeCount + 1;
    // WebSocket 实时推送：文章点赞
    this.events.pushLike(article.title, newLikeCount, { slug });
    return { likeCount: newLikeCount };
  }

  async create(dto: CreateArticleDto) {
    const { tagIds, categoryId, aiAutoFill, ...rest } = dto;
    let finalTagIds = tagIds ? [...tagIds] : [];

    if (aiAutoFill && this.aiContent.enabled) {
      const needSummary = !rest.summary?.trim();
      const needKeywords = !rest.seoKeywords?.trim();
      const needDesc = !rest.seoDescription?.trim();
      const needTags = finalTagIds.length === 0;
      if (needSummary || needKeywords || needDesc || needTags) {
        const meta = await this.aiContent.generateMeta(rest.title, rest.content);
        if (meta) {
          if (needSummary) rest.summary = meta.summary;
          if (needKeywords) rest.seoKeywords = meta.keywords.join(',');
          if (needDesc) rest.seoDescription = meta.seoDescription;
          if (needTags) finalTagIds = await this.matchTagIds(meta.tags, true);
        }
      }
    }

    const article = await this.prisma.article.create({
      data: {
        ...rest,
        categoryId: BigInt(categoryId),
        publishTime: rest.isPublish === 1 ? new Date() : null,
        tags: finalTagIds.length
          ? { create: finalTagIds.map((tid) => ({ tagId: BigInt(tid) })) }
          : undefined,
      } as any,
    });
    return this.serialize(article);
  }

  async update(id: number, dto: UpdateArticleDto) {
    await this.findOneOrFail(id);
    const { tagIds, categoryId, aiAutoFill, ...rest } = dto;
    let finalTagIds = tagIds;

    if (aiAutoFill && this.aiContent.enabled && rest.content) {
      const needSummary = rest.summary !== undefined && !rest.summary?.trim();
      const needKeywords = rest.seoKeywords !== undefined && !rest.seoKeywords?.trim();
      const needDesc = rest.seoDescription !== undefined && !rest.seoDescription?.trim();
      const needTags = finalTagIds !== undefined && finalTagIds.length === 0;
      if (needSummary || needKeywords || needDesc || needTags) {
        const meta = await this.aiContent.generateMeta(rest.title || '', rest.content);
        if (meta) {
          if (needSummary) rest.summary = meta.summary;
          if (needKeywords) rest.seoKeywords = meta.keywords.join(',');
          if (needDesc) rest.seoDescription = meta.seoDescription;
          if (needTags) finalTagIds = await this.matchTagIds(meta.tags, true);
        }
      }
    }

    if (finalTagIds !== undefined) {
      await this.prisma.articleTagRelation.deleteMany({ where: { articleId: BigInt(id) } });
      if (finalTagIds.length) {
        await this.prisma.articleTagRelation.createMany({
          data: finalTagIds.map((tid) => ({ articleId: BigInt(id), tagId: BigInt(tid) })),
        });
      }
    }
    const updated = await this.prisma.article.update({
      where: { id: BigInt(id) },
      data: {
        ...rest,
        ...(categoryId ? { categoryId: BigInt(categoryId) } : {}),
      } as any,
      include: { category: true, tags: { include: { tag: true } } },
    });
    return this.serialize(updated);
  }

  /**
   * 根据标签名数组匹配现有标签，返回 tagId 数组
   * @param names AI 提取的标签名
   * @param createIfMissing 未命中时是否自动创建新标签
   */
  private async matchTagIds(names: string[], createIfMissing: boolean): Promise<number[]> {
    if (!names?.length) return [];
    const unique = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
    if (!unique.length) return [];

    const existing = await this.prisma.articleTag.findMany({
      where: { deleteTime: 0n, tagName: { in: unique } },
    });
    const existingMap = new Map(existing.map((t) => [t.tagName.toLowerCase(), t]));
    const result: number[] = existing.map((t) => Number(t.id));

    if (createIfMissing) {
      const missing = unique.filter((n) => !existingMap.has(n.toLowerCase()));
      for (const name of missing) {
        try {
          const created = await this.prisma.articleTag.create({
            data: {
              tagName: name,
              slug: this.slugify(name),
            } as any,
          });
          result.push(Number(created.id));
        } catch (err) {
          this.logger.warn(`自动创建标签失败: ${name}`, err as any);
        }
      }
    }
    return result;
  }

  private slugify(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return base || `tag-${Date.now().toString(36)}`;
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.article.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }

  private async findOneOrFail(id: number) {
    const item = await this.prisma.article.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('文章不存在');
    return item;
  }

  private serialize(article: any) {
    return {
      ...article,
      id: String(article.id),
      categoryId: String(article.categoryId),
      deleteTime: String(article.deleteTime),
      tags: article.tags?.map((t: any) => ({
        ...t,
        tagId: String(t.tagId),
        articleId: String(t.articleId),
        tag: t.tag ? { ...t.tag, id: String(t.tag.id), deleteTime: String(t.tag.deleteTime) } : null,
      })),
      category: article.category ? { ...article.category, id: String(article.category.id) } : null,
    };
  }
}
