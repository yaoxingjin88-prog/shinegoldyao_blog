import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CacheTTL } from '../../common/interceptors/cache.interceptor';
import { ArticleService } from './article.service';
import { AiExplainDto, AiGenerateDto, AiWriteAssistDto, CreateArticleDto, QueryArticleDto, UpdateArticleDto } from './dto/article.dto';

@ApiTags('文章')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Public()
  @Get()
  @CacheTTL(30)
  @ApiOperation({ summary: '获取文章列表（分页+筛选）' })
  findAll(@Query() query: QueryArticleDto) {
    return this.articleService.findAll(query);
  }

  @ApiBearerAuth()
  @Get('admin')
  @ApiOperation({ summary: '管理端文章列表' })
  findAllAdmin(@Query() query: QueryArticleDto) {
    return this.articleService.findAllAdmin(query);
  }

  @ApiBearerAuth()
  @Get('admin/ai-logs')
  @ApiOperation({ summary: '管理端：AI 辅助阅读日志（分析/解释）' })
  aiLogs(@Query() query: { page?: number; pageSize?: number; actionType?: string }) {
    return this.articleService.aiLogs(query);
  }

  @ApiBearerAuth()
  @Get('admin/:id')
  @ApiOperation({ summary: '管理端获取文章详情（按ID）' })
  findByIdAdmin(@Param('id') id: string) {
    return this.articleService.findById(+id);
  }

  @Public()
  @Get(':slug')
  @CacheTTL(30)
  @ApiOperation({ summary: '获取文章详情（按slug，自增阅读数）' })
  findBySlug(@Param('slug') slug: string) {
    return this.articleService.findBySlug(slug);
  }

  @Public()
  @Post(':slug/like')
  @ApiOperation({ summary: '文章点赞' })
  like(@Param('slug') slug: string) {
    return this.articleService.likeBySlug(slug);
  }

  @Public()
  @Post('ai-explain')
  @ApiOperation({ summary: 'AI 解释术语或选中文本' })
  aiExplain(@Body() dto: AiExplainDto, @Req() req: Request) {
    return this.articleService.aiExplain(dto.text, dto.context, this.getIp(req), req.headers['user-agent'] || '');
  }

  @Public()
  @Get(':slug/ai-read')
  @CacheTTL(3600)
  @ApiOperation({ summary: 'AI 辅助阅读：思维导图 / 术语解释（结果缓存 1 小时）' })
  aiRead(
    @Param('slug') slug: string,
    @Query('mode') mode: 'mindmap' | 'terms' | 'all' | undefined,
    @Req() req: Request,
  ) {
    const m = mode === 'mindmap' || mode === 'terms' ? mode : 'all';
    return this.articleService.aiRead(slug, m, this.getIp(req), req.headers['user-agent'] || '');
  }

  private getIp(req: Request): string {
    const xff = req.headers['x-forwarded-for'] as string | undefined;
    return (xff?.split(',')[0] || req.socket?.remoteAddress || '').trim();
  }

  @ApiBearerAuth()
  @Post('ai-write-assist')
  @ApiOperation({ summary: 'AI 写作辅助：润色 / 重写 / 续写 / 精简（选中文本）' })
  aiWriteAssist(@Body() dto: AiWriteAssistDto) {
    return this.articleService.aiWriteAssist(dto.text, dto.action, dto.context);
  }

  @ApiBearerAuth()
  @Post('ai-generate')
  @ApiOperation({ summary: 'AI 生成摘要/SEO关键词/推荐标签（预览，不落库）' })
  aiGenerate(@Body() dto: AiGenerateDto) {
    return this.articleService.aiGenerate(dto);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '新增文章（支持 aiAutoFill 自动补全）' })
  create(@Body() dto: CreateArticleDto) {
    return this.articleService.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: '更新文章' })
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articleService.update(+id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '删除文章' })
  remove(@Param('id') id: string) {
    return this.articleService.remove(+id);
  }
}
