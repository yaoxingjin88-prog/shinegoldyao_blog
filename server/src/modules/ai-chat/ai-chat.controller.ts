import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { AiChatService } from './ai-chat.service';
import { ChatRequestDto } from './dto/chat.dto';

@ApiTags('AI 聊天')
@Controller('ai-chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Public()
  @Post('stream')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'AI 对话（SSE 流式响应）' })
  async streamChat(@Body() dto: ChatRequestDto, @Req() req: Request, @Res() res: Response) {
    return this.aiChatService.streamChat(dto, req, res);
  }

  @Public()
  @Get('quota')
  @ApiOperation({ summary: '查询当前 IP 的 AI 对话配额（用于前端同步显示剩余次数）' })
  getQuota(@Req() req: Request) {
    return this.aiChatService.getQuota(req);
  }

  @ApiBearerAuth()
  @Get('logs')
  @ApiOperation({ summary: '获取 AI 聊天记录（需认证）' })
  findAll(@Query() query: { page?: number; pageSize?: number }) {
    return this.aiChatService.findAll(query);
  }
}
