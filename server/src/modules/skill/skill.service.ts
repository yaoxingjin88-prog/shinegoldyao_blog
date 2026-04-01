import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillCategoryDto, CreateSkillDto, UpdateSkillCategoryDto, UpdateSkillDto } from './dto/skill.dto';

@Injectable()
export class SkillService {
  constructor(private prisma: PrismaService) {}

  findCategories() {
    return this.prisma.skillCategory.findMany({
      where: { deleteTime: 0n },
      orderBy: { sort: 'desc' },
      include: { skills: { where: { deleteTime: 0n, isEnable: 1 }, orderBy: { sort: 'desc' } } },
    });
  }

  findSkills(categoryId?: number) {
    return this.prisma.skill.findMany({
      where: { deleteTime: 0n, isEnable: 1, ...(categoryId ? { categoryId: BigInt(categoryId) } : {}) },
      orderBy: { sort: 'desc' },
      include: { category: true },
    });
  }

  createCategory(dto: CreateSkillCategoryDto) {
    return this.prisma.skillCategory.create({ data: dto as any });
  }

  async updateCategory(id: number, dto: UpdateSkillCategoryDto) {
    await this.findCategoryOrFail(id);
    return this.prisma.skillCategory.update({ where: { id: BigInt(id) }, data: dto as any });
  }

  async removeCategory(id: number) {
    await this.findCategoryOrFail(id);
    return this.prisma.skillCategory.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }

  createSkill(dto: CreateSkillDto) {
    const { categoryId, ...rest } = dto;
    return this.prisma.skill.create({ data: { ...rest, categoryId: BigInt(categoryId) } as any });
  }

  async updateSkill(id: number, dto: UpdateSkillDto) {
    await this.findSkillOrFail(id);
    const { categoryId, ...rest } = dto;
    return this.prisma.skill.update({
      where: { id: BigInt(id) },
      data: { ...rest, ...(categoryId ? { categoryId: BigInt(categoryId) } : {}) } as any,
    });
  }

  async removeSkill(id: number) {
    await this.findSkillOrFail(id);
    return this.prisma.skill.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }

  private async findCategoryOrFail(id: number) {
    const item = await this.prisma.skillCategory.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('技术分类不存在');
    return item;
  }

  private async findSkillOrFail(id: number) {
    const item = await this.prisma.skill.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('技术栈不存在');
    return item;
  }
}
