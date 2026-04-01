import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.banner.findMany({
      where: { deleteTime: 0n, isEnable: 1 },
      orderBy: { sort: 'desc' },
    });
  }

  findAllAdmin() {
    return this.prisma.banner.findMany({
      where: { deleteTime: 0n },
      orderBy: { sort: 'desc' },
    });
  }

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateBannerDto) {
    await this.findOneOrFail(id);
    return this.prisma.banner.update({ where: { id: BigInt(id) }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.banner.update({
      where: { id: BigInt(id) },
      data: { deleteTime: BigInt(Date.now()) },
    });
  }

  private async findOneOrFail(id: number) {
    const item = await this.prisma.banner.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('轮播图不存在');
    return item;
  }
}
