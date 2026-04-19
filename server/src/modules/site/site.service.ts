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

  /**
   * 获取知识图谱数据：
   * 根节点 = 站点主题
   * 一级 = 技能分类 / 文章分类
   * 二级 = 具体技能 / 标签
   * 三级 = 文章（通过标签关联）
   */
  async getKnowledgeGraph(): Promise<any> {
    const [skillCats, articleCats, articles] = await Promise.all([
      this.prisma.skillCategory.findMany({
        where: { deleteTime: 0n, isEnable: 1 },
        include: { skills: { where: { deleteTime: 0n, isEnable: 1 } } },
      }),
      this.prisma.articleCategory.findMany({ where: { deleteTime: 0n } }),
      this.prisma.article.findMany({
        where: { deleteTime: 0n, isPublish: 1 },
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          likeCount: true,
          categoryId: true,
          tags: {
            include: { tag: { select: { id: true, tagName: true, themeColor: true } } },
          },
        },
        orderBy: { publishTime: 'desc' },
        take: 50,
      }),
    ]);

    interface Node {
      id: string;
      name: string;
      category: number;
      symbolSize: number;
      value?: number;
      slug?: string;
      color?: string;
    }
    interface Link {
      source: string;
      target: string;
    }

    const nodes: Node[] = [];
    const links: Link[] = [];

    // 分类索引 (ECharts categories)
    const categories = [
      { name: '核心' },         // 0
      { name: '技能分类' },     // 1
      { name: '技能' },         // 2
      { name: '文章分类' },     // 3
      { name: '标签' },         // 4
      { name: '文章' },         // 5
    ];

    // 0. 根节点
    const rootId = 'root';
    nodes.push({ id: rootId, name: 'DevVoyage', category: 0, symbolSize: 60 });

    // 1-2. 技能分类 → 技能
    for (const sc of skillCats) {
      const scId = `sc_${sc.id}`;
      nodes.push({ id: scId, name: sc.categoryName, category: 1, symbolSize: 40, color: sc.themeColor });
      links.push({ source: rootId, target: scId });
      for (const sk of sc.skills || []) {
        const skId = `sk_${sk.id}`;
        nodes.push({
          id: skId,
          name: sk.skillName,
          category: 2,
          symbolSize: 20 + (sk.proficiency || 50) / 10,
        });
        links.push({ source: scId, target: skId });
      }
    }

    // 3. 文章分类
    const catIdMap = new Map<string, string>();
    for (const ac of articleCats) {
      const acId = `ac_${ac.id}`;
      catIdMap.set(String(ac.id), acId);
      nodes.push({ id: acId, name: ac.categoryName, category: 3, symbolSize: 35 });
      links.push({ source: rootId, target: acId });
    }

    // 4. 标签（去重）
    const tagNodeIds = new Map<string, string>();
    for (const art of articles) {
      for (const rel of art.tags || []) {
        const tag = rel.tag;
        if (!tag) continue;
        const tagId = `tag_${tag.id}`;
        if (!tagNodeIds.has(tagId)) {
          tagNodeIds.set(tagId, tag.tagName);
          nodes.push({
            id: tagId,
            name: tag.tagName,
            category: 4,
            symbolSize: 22,
            color: tag.themeColor,
          });
        }
      }
    }

    // 5. 文章节点 + 连接到分类 + 连接到标签
    for (const art of articles) {
      const artId = `art_${art.id}`;
      const weight = (art.viewCount || 0) + (art.likeCount || 0) * 2;
      nodes.push({
        id: artId,
        name: art.title,
        slug: art.slug,
        category: 5,
        symbolSize: 18 + Math.min(20, Math.sqrt(weight)),
        value: weight,
      });
      // 文章 → 分类
      const acId = catIdMap.get(String(art.categoryId));
      if (acId) links.push({ source: acId, target: artId });
      // 文章 → 标签
      for (const rel of art.tags || []) {
        const tagId = `tag_${rel.tag?.id}`;
        if (tagNodeIds.has(tagId)) links.push({ source: tagId, target: artId });
      }
    }

    return { nodes, links, categories };
  }
}
