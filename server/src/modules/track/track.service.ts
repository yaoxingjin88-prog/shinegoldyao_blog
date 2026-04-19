import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { BatchClickDto, CreateTrackDto } from './dto/track.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { UAParser } = require('ua-parser-js');

@Injectable()
export class TrackService {
  private readonly recentIps = new Map<string, number>();

  constructor(private prisma: PrismaService, private events: EventsService) {}

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

    // WebSocket 实时推送：新访客到达
    this.events.pushVisit(dto.path || '/', { ip, device, browser, os });

    return { success: true };
  }

  /**
   * 记录一次“愤怒点击”事件（Rage Click）：
   * 前端在 1.2s 内同一位置连续点击 ≥ 4 次即视为 rage click，
   * 后端仅做一次推送 + 可选入库（此处直接推送，避免刷量）
   */
  async reportRageClick(path: string, count: number, ip: string, meta?: Record<string, any>) {
    this.events.pushRageClick(path || '/', count, { ip, ...meta });
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

  /** 批量记录点击坐标（前台埋点） */
  async createClicks(dto: BatchClickDto, ip: string) {
    if (!dto.clicks?.length) return { success: true, count: 0 };
    const path = (dto.path || '').substring(0, 500);
    const data = dto.clicks
      .filter((c) => typeof c.x === 'number' && typeof c.y === 'number')
      .slice(0, 50) // 单次最多 50 条，防止刷量
      .map((c) => ({
        ip,
        path,
        x: Math.min(1, Math.max(0, Number(c.x) || 0)),
        y: Math.min(1, Math.max(0, Number(c.y) || 0)),
        w: Math.round(c.w || 1920),
        h: Math.round(c.h || 1080),
        tag: (c.tag || '').substring(0, 50),
      }));
    if (!data.length) return { success: true, count: 0 };
    await this.prisma.clickLog.createMany({ data });
    return { success: true, count: data.length };
  }

  /**
   * 查询热力图数据：指定路径下的点击坐标分布
   * - 对 /articles 这种聚合路径，自动匹配其全部子路径（/articles, /articles/xxx）
   * - 对精确路径（如 /、/graph），走等值匹配
   */
  async getHeatmap(path: string, limit = 2000) {
    // 聚合前缀路径集合：列表页 + 其全部详情子页
    const AGGREGATE_PREFIXES = ['/articles'];
    const useAggregate = AGGREGATE_PREFIXES.includes(path);

    const where = useAggregate
      ? {
          OR: [
            { path },
            { path: { startsWith: `${path}/` } },
          ],
        }
      : { path };

    const list = await this.prisma.clickLog.findMany({
      where: where as any,
      select: { x: true, y: true, tag: true },
      orderBy: { createTime: 'desc' },
      take: Math.min(limit, 5000),
    });
    // 聚合到 50×50 网格以提升渲染性能
    const grid: Record<string, number> = {};
    for (const c of list) {
      const gx = Math.min(49, Math.floor(c.x * 50));
      const gy = Math.min(49, Math.floor(c.y * 50));
      const key = `${gx},${gy}`;
      grid[key] = (grid[key] || 0) + 1;
    }
    const points = Object.entries(grid).map(([k, v]) => {
      const [gx, gy] = k.split(',').map(Number);
      return [gx, gy, v];
    });
    return { total: list.length, points };
  }

  /** 获取有点击数据的路径列表（供管理端下拉选择） */
  async getClickPaths() {
    const rows: Array<{ path: string; count: bigint }> = await this.prisma.$queryRaw`
      SELECT path, COUNT(*) as count FROM click_log
      WHERE path != ''
      GROUP BY path
      ORDER BY count DESC
      LIMIT 50
    `;
    return rows.map((r) => ({ path: r.path, count: Number(r.count) }));
  }

  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalPV, todayPV, todayUV, totalUV] = await Promise.all([
      this.prisma.visitLog.count(),
      this.prisma.visitLog.count({
        where: { createTime: { gte: todayStart } },
      }),
      this.prisma.visitLog.findMany({
        where: { createTime: { gte: todayStart } },
        distinct: ['ip'],
        select: { ip: true },
      }).then((r) => r.length),
      this.prisma.visitLog.findMany({
        distinct: ['ip'],
        select: { ip: true },
      }).then((r) => r.length),
    ]);

    return { totalPV, todayPV, todayUV, totalUV };
  }
}
