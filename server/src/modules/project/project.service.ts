import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany({
      where: { deleteTime: 0n, isShow: 1 },
      orderBy: { sort: 'desc' },
    });
  }

  findAllAdmin() {
    return this.prisma.project.findMany({ where: { deleteTime: 0n }, orderBy: { sort: 'desc' } });
  }

  findOne(id: number) {
    return this.prisma.project.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateProjectDto) {
    await this.findOneOrFail(id);
    return this.prisma.project.update({ where: { id: BigInt(id) }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.project.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }

  private async findOneOrFail(id: number) {
    const item = await this.prisma.project.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('项目不存在');
    return item;
  }
}
