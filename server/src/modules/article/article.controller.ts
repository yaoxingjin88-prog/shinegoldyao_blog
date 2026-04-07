import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ArticleService } from './article.service';
import { CreateArticleDto, QueryArticleDto, UpdateArticleDto } from './dto/article.dto';

@ApiTags('文章')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Public()
  @Get()
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
  @Get('admin/:id')
  @ApiOperation({ summary: '管理端获取文章详情（按ID）' })
  findByIdAdmin(@Param('id') id: string) {
    return this.articleService.findById(+id);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: '获取文章详情（按slug，自增阅读数）' })
  findBySlug(@Param('slug') slug: string) {
    return this.articleService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '新增文章' })
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
