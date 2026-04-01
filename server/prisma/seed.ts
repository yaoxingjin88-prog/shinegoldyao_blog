import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123456', 10);
  await prisma.adminUser.upsert({
    where: { id: 1n },
    update: {},
    create: { username: 'admin', password: hashedPassword, nickname: '管理员', status: 1 },
  });

  const siteConfigs = [
    { configKey: 'site_title', configValue: 'DevVoyage', description: '网站标题' },
    { configKey: 'site_subtitle', configValue: '架构代码，书写未来', description: '网站副标题' },
    { configKey: 'home_intro', configValue: '全栈开发者 / 开源爱好者 / 技术博主', description: '首页简介' },
    { configKey: 'avatar', configValue: '', description: '个人头像' },
    { configKey: 'seo_keywords', configValue: 'DevVoyage,技术博客,全栈开发', description: 'SEO关键词' },
    { configKey: 'seo_description', configValue: '专注于前沿技术分享与开源项目展示的个人技术博客', description: 'SEO描述' },
  ];

  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { configKey: config.configKey },
      update: {},
      create: config,
    });
  }

  console.log('✅ Seed data inserted successfully');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
