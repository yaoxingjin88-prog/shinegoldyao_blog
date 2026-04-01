import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto, QueryMessageDto } from './dto/message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryMessageDto) {
    const { page = 1, pageSize = 10, isRead } = query;
    const where: any = { deleteTime: 0n };
    if (isRead !== undefined) where.isRead = isRead;

    const [list, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createTime: 'desc' },
      }),
      this.prisma.message.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  create(dto: CreateMessageDto, req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    return this.prisma.message.create({
      data: { ...dto, ipAddress, userAgent } as any,
    });
  }

  async markRead(id: number) {
    const item = await this.prisma.message.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('留言不存在');
    return this.prisma.message.update({ where: { id: BigInt(id) }, data: { isRead: 1 } });
  }

  async remove(id: number) {
    const item = await this.prisma.message.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('留言不存在');
    return this.prisma.message.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }
}
