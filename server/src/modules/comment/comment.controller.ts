import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { CreateCommentDto, QueryCommentDto } from './dto/comment.dto';
import { CommentService } from './comment.service';

@ApiTags('评论')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Public()
  @Get('article/:articleId')
  @ApiOperation({ summary: '获取文章评论（公开）' })
  findByArticle(@Param('articleId') articleId: string) {
    return this.commentService.findByArticle(+articleId);
  }

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: '获取评论列表（管理后台）' })
  findAll(@Query() query: QueryCommentDto) {
    return this.commentService.findAll(query);
  }

  @Public()
  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: '提交评论（IP限速10次/分钟）' })
  create(@Body() dto: CreateCommentDto, @Req() req: Request) {
    return this.commentService.create(dto, req);
  }

  @ApiBearerAuth()
  @Patch(':id/approve')
  @ApiOperation({ summary: '审核评论' })
  approve(@Param('id') id: string, @Body('isApproved') isApproved: number) {
    return this.commentService.approve(+id, isApproved);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '删除评论' })
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
