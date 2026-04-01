import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.articleTag.findMany({ where: { deleteTime: 0n } });
  }

  create(dto: CreateTagDto) {
    return this.prisma.articleTag.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateTagDto) {
    await this.findOneOrFail(id);
    return this.prisma.articleTag.update({ where: { id: BigInt(id) }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.articleTag.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }

  private async findOneOrFail(id: number) {
    const item = await this.prisma.articleTag.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('标签不存在');
    return item;
  }
}
