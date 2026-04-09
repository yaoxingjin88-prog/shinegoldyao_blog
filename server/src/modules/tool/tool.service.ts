import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateToolCategoryDto, UpdateToolCategoryDto, CreateToolItemDto, UpdateToolItemDto } from './dto/tool.dto';

@Injectable()
export class ToolService {
  constructor(private prisma: PrismaService) {}

  // ---- 前台：获取启用的分类及其工具 ----
  findAllPublic() {
    return this.prisma.toolCategory.findMany({
      where: { deleteTime: 0n, isEnable: 1 },
      orderBy: { sort: 'desc' },
      include: {
        tools: {
          where: { deleteTime: 0n, isEnable: 1 },
          orderBy: { sort: 'desc' },
        },
      },
    });
  }

  // ---- 管理端：分类 CRUD ----
  findAllCategoriesAdmin() {
    return this.prisma.toolCategory.findMany({
      where: { deleteTime: 0n },
      orderBy: { sort: 'desc' },
      include: {
        tools: {
          where: { deleteTime: 0n },
          orderBy: { sort: 'desc' },
        },
      },
    });
  }

  createCategory(dto: CreateToolCategoryDto) {
    return this.prisma.toolCategory.create({ data: dto as any });
  }

  async updateCategory(id: number, dto: UpdateToolCategoryDto) {
    await this.findCategoryOrFail(id);
    return this.prisma.toolCategory.update({ where: { id: BigInt(id) }, data: dto as any });
  }

  async removeCategory(id: number) {
    await this.findCategoryOrFail(id);
    return this.prisma.toolCategory.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }

  private async findCategoryOrFail(id: number) {
    const item = await this.prisma.toolCategory.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('工具分类不存在');
    return item;
  }

  // ---- 管理端：工具项 CRUD ----
  findAllItemsAdmin() {
    return this.prisma.toolItem.findMany({
      where: { deleteTime: 0n },
      orderBy: { sort: 'desc' },
      include: { category: true },
    });
  }

  createItem(dto: CreateToolItemDto) {
    return this.prisma.toolItem.create({ data: { ...dto, categoryId: BigInt(dto.categoryId) } as any });
  }

  async updateItem(id: number, dto: UpdateToolItemDto) {
    await this.findItemOrFail(id);
    const data: any = { ...dto };
    if (dto.categoryId !== undefined) data.categoryId = BigInt(dto.categoryId);
    return this.prisma.toolItem.update({ where: { id: BigInt(id) }, data });
  }

  async removeItem(id: number) {
    await this.findItemOrFail(id);
    return this.prisma.toolItem.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }

  private async findItemOrFail(id: number) {
    const item = await this.prisma.toolItem.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('工具不存在');
    return item;
  }
}
