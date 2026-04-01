import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSiteConfigDto } from './dto/site.dto';

@Injectable()
export class SiteService {
  constructor(private prisma: PrismaService) {}

  async getConfig() {
    const configs = await this.prisma.siteConfig.findMany({ orderBy: { id: 'asc' } });
    const result: Record<string, string> = {};
    configs.forEach((c) => { result[c.configKey] = c.configValue || ''; });
    return result;
  }

  async updateConfig(dto: UpdateSiteConfigDto) {
    const updates = dto.configs.map((item) =>
      this.prisma.siteConfig.upsert({
        where: { configKey: item.key },
        update: { configValue: item.value },
        create: { configKey: item.key, configValue: item.value },
      }),
    );
    await Promise.all(updates);
    return null;
  }
}
