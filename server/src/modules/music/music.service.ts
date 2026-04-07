import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMusicDto, UpdateMusicDto } from './dto/music.dto';

@Injectable()
export class MusicService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.music.findMany({
      where: { deleteTime: 0n, isEnable: 1 },
      orderBy: { sort: 'desc' },
    });
  }

  findAllAdmin() {
    return this.prisma.music.findMany({
      where: { deleteTime: 0n },
      orderBy: { sort: 'desc' },
    });
  }

  create(dto: CreateMusicDto) {
    return this.prisma.music.create({ data: dto as any });
  }

  async update(id: number, dto: UpdateMusicDto) {
    await this.findOneOrFail(id);
    return this.prisma.music.update({ where: { id: BigInt(id) }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOneOrFail(id);
    return this.prisma.music.update({ where: { id: BigInt(id) }, data: { deleteTime: BigInt(Date.now()) } });
  }

  private async findOneOrFail(id: number) {
    const item = await this.prisma.music.findFirst({ where: { id: BigInt(id), deleteTime: 0n } });
    if (!item) throw new NotFoundException('音乐不存在');
    return item;
  }
}
