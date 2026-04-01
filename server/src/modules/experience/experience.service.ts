import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';

@Injectable()
export class ExperienceService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.experience.findMany({
      where: { deleteTime: 0n, isShow: 1 },
      orderBy: [{ sort: 'desc' }, { startDate: 'desc' }],
    });
  }

  findAllAdmin() {
    return this.prisma.experience.findMany({ where: { deleteTime: 0n }, orderBy: [{ sort: 'desc' }] });
  }

  create(dto: CreateExperienceDto) {
    return this.prisma.experience.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateExperienceDto) {
    await this.findOneOrFail(id);
    return this.prisma.experience.update({ where: { id: BigInt(id) }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.experience.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }

  private async findOneOrFail(id: number) {
    const item = await this.prisma.experience.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('经历不存在');
    return item;
  }
}
