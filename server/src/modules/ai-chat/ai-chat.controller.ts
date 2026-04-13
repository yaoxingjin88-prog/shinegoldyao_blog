import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
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
  async streamChat(@Body() dto: ChatRequestDto, @Res() res: Response) {
    return this.aiChatService.streamChat(dto, res);
  }
}
