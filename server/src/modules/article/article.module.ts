import { Module } from '@nestjs/common';
import { AiContentService } from './ai-content.service';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService, AiContentService],
})
export class ArticleModule {}
