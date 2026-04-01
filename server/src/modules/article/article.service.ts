import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto, QueryArticleDto, UpdateArticleDto } from './dto/article.dto';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

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

  async findBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: { slug, deleteTime: 0n, isPublish: 1 },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!article) throw new NotFoundException('文章不存在');
    await this.prisma.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } });
    return this.serialize(article);
  }

  async create(dto: CreateArticleDto) {
    const { tagIds, categoryId, ...rest } = dto;
    const article = await this.prisma.article.create({
      data: {
        ...rest,
        categoryId: BigInt(categoryId),
        publishTime: rest.isPublish === 1 ? new Date() : null,
        tags: tagIds?.length
          ? { create: tagIds.map((tid) => ({ tagId: BigInt(tid) })) }
          : undefined,
      } as any,
    });
    return this.serialize(article);
  }

  async update(id: number, dto: UpdateArticleDto) {
    await this.findOneOrFail(id);
    const { tagIds, categoryId, ...rest } = dto;
    if (tagIds !== undefined) {
      await this.prisma.articleTagRelation.deleteMany({ where: { articleId: BigInt(id) } });
      if (tagIds.length) {
        await this.prisma.articleTagRelation.createMany({
          data: tagIds.map((tid) => ({ articleId: BigInt(id), tagId: BigInt(tid) })),
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
