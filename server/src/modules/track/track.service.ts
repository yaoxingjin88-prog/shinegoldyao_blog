import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrackDto } from './dto/track.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { UAParser } = require('ua-parser-js');

@Injectable()
export class TrackService {
  private readonly recentIps = new Map<string, number>();

  constructor(private prisma: PrismaService) {}

  async createTrack(dto: CreateTrackDto, ip: string, headerUA: string) {
    const ua = dto.userAgent || headerUA || '';
    const now = Date.now();

    // 同一 IP 10秒内不重复记录同一路径
    const key = `${ip}:${dto.path || '/'}`;
    const lastTime = this.recentIps.get(key);
    if (lastTime && now - lastTime < 10000) {
      return { success: true, throttled: true };
    }
    this.recentIps.set(key, now);

    // 定期清理过期缓存
    if (this.recentIps.size > 10000) {
      for (const [k, t] of this.recentIps.entries()) {
        if (now - t > 60000) this.recentIps.delete(k);
      }
    }

    const parser = new UAParser(ua);
    const browserInfo = parser.getBrowser();
    const osInfo = parser.getOS();
    const deviceInfo = parser.getDevice();

    const browser = [browserInfo.name, browserInfo.version].filter(Boolean).join(' ');
    const os = [osInfo.name, osInfo.version].filter(Boolean).join(' ');
    const device = deviceInfo.type || 'desktop';

    await this.prisma.visitLog.create({
      data: {
        ip,
        path: dto.path || '',
        title: dto.title || '',
        userAgent: ua.substring(0, 500),
        browser,
        os,
        device,
      },
    });

    return { success: true };
  }

  async findAll(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [list, total] = await Promise.all([
      this.prisma.visitLog.findMany({
        orderBy: { createTime: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.visitLog.count(),
    ]);
    return { list, total, page, pageSize };
  }

  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalPV, todayPV, todayUV, totalUV] = await Promise.all([
      this.prisma.visitLog.count(),
      this.prisma.visitLog.count({
        where: { createTime: { gte: todayStart } },
      }),
      this.prisma.visitLog.groupBy({
        by: ['ip'],
        where: { createTime: { gte: todayStart } },
      }).then((r) => r.length),
      this.prisma.visitLog.groupBy({
        by: ['ip'],
      }).then((r) => r.length),
    ]);

    return { totalPV, todayPV, todayUV, totalUV };
  }
}
