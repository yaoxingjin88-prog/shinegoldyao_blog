import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';

@Injectable()
export class ExperienceService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.experience.findMany({
      where: { deleteTime: 0n, isShow: 1 },
      orderBy: [{ sort: 'asc' }, { startDate: 'desc' }],
    });
  }

  findAllAdmin() {
    return this.prisma.experience.findMany({ where: { deleteTime: 0n }, orderBy: [{ sort: 'asc' }] });
  }

  create(dto: CreateExperienceDto) {
    const data: any = { ...dto }
    if (data.startDate) data.startDate = new Date(data.startDate)
    if (data.endDate) data.endDate = new Date(data.endDate)
    return this.prisma.experience.create({ data })
  }

  async update(id: number, dto: UpdateExperienceDto) {
    await this.findOneOrFail(id);
    const data: any = { ...dto }
    if (data.startDate) data.startDate = new Date(data.startDate)
    if (data.endDate) data.endDate = new Date(data.endDate)
    return this.prisma.experience.update({ where: { id: BigInt(id) }, data })
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
