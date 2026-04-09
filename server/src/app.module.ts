import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { join } from 'path';
import configuration from './config/configuration';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ApiCacheInterceptor } from './common/interceptors/cache.interceptor';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { SiteModule } from './modules/site/site.module';
import { BannerModule } from './modules/banner/banner.module';
import { SkillModule } from './modules/skill/skill.module';
import { ArticleModule } from './modules/article/article.module';
import { CategoryModule } from './modules/category/category.module';
import { TagModule } from './modules/tag/tag.module';
import { ProjectModule } from './modules/project/project.module';
import { SocialModule } from './modules/social/social.module';
import { MessageModule } from './modules/message/message.module';
import { CommentModule } from './modules/comment/comment.module';
import { ExperienceModule } from './modules/experience/experience.module';
import { MusicModule } from './modules/music/music.module';
import { UploadModule } from './modules/upload/upload.module';
import { ToolModule } from './modules/tool/tool.module';
import { TrackModule } from './modules/track/track.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 1000 },
      { name: 'short', ttl: 1000, limit: 100 },
      { name: 'medium', ttl: 10000, limit: 500 },
      { name: 'long', ttl: 60000, limit: 1000 },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    SiteModule,
    BannerModule,
    SkillModule,
    ArticleModule,
    CategoryModule,
    TagModule,
    ProjectModule,
    SocialModule,
    MessageModule,
    CommentModule,
    ExperienceModule,
    MusicModule,
    UploadModule,
    ToolModule,
    TrackModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: ApiCacheInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
