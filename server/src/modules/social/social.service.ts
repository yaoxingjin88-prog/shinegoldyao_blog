import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialDto, UpdateSocialDto } from './dto/social.dto';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.socialLink.findMany({ where: { deleteTime: 0n, isShow: 1 }, orderBy: { sort: 'desc' } });
  }

  findAllAdmin() {
    return this.prisma.socialLink.findMany({ where: { deleteTime: 0n }, orderBy: { sort: 'desc' } });
  }

  create(dto: CreateSocialDto) {
    return this.prisma.socialLink.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateSocialDto) {
    await this.findOneOrFail(id);
    return this.prisma.socialLink.update({ where: { id: BigInt(id) }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.socialLink.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }

  private async findOneOrFail(id: number) {
    const item = await this.prisma.socialLink.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('社交链接不存在');
    return item;
  }
}
