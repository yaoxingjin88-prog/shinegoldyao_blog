import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.articleCategory.findMany({
      where: { deleteTime: 0n, isEnable: 1 },
      orderBy: { sort: 'desc' },
    });
  }

  findAllAdmin() {
    return this.prisma.articleCategory.findMany({ where: { deleteTime: 0n }, orderBy: { sort: 'desc' } });
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.articleCategory.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOneOrFail(id);
    return this.prisma.articleCategory.update({ where: { id: BigInt(id) }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.articleCategory.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }

  private async findOneOrFail(id: number) {
    const item = await this.prisma.articleCategory.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('文章分类不存在');
    return item;
  }
}
