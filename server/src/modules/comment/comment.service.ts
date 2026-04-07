import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, QueryCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async findByArticle(articleId: number) {
    const comments = await this.prisma.comment.findMany({
      where: { articleId: BigInt(articleId), deleteTime: 0n, isApproved: 1 },
      orderBy: { createTime: 'asc' },
    });
    return comments;
  }

  async findAll(query: QueryCommentDto) {
    const { page = 1, pageSize = 10, articleId, isApproved } = query;
    const where: any = { deleteTime: 0n };
    if (articleId !== undefined) where.articleId = BigInt(articleId);
    if (isApproved !== undefined) where.isApproved = isApproved;

    const [list, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createTime: 'desc' },
      }),
      this.prisma.comment.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  create(dto: CreateCommentDto, req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    return this.prisma.comment.create({
      data: {
        articleId: BigInt(dto.articleId),
        parentId: dto.parentId ? BigInt(dto.parentId) : 0n,
        nickname: dto.nickname,
        email: dto.email,
        content: dto.content,
        website: dto.website || '',
        ipAddress,
        userAgent,
      },
    });
  }

  async remove(id: number) {
    const item = await this.prisma.comment.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('评论不存在');
    return this.prisma.comment.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }

  async approve(id: number, isApproved: number) {
    const item = await this.prisma.comment.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('评论不存在');
    return this.prisma.comment.update({ where: { id: BigInt(id) }, data: { isApproved } });
  }
}
