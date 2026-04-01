import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { CreateMessageDto, QueryMessageDto } from './dto/message.dto';
import { MessageService } from './message.service';

@ApiTags('留言')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: '获取留言列表（需认证）' })
  findAll(@Query() query: QueryMessageDto) {
    return this.messageService.findAll(query);
  }

  @Public()
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '提交留言（IP限速5次/分钟）' })
  create(@Body() dto: CreateMessageDto, @Req() req: Request) {
    return this.messageService.create(dto, req);
  }

  @ApiBearerAuth()
  @Patch(':id/read')
  @ApiOperation({ summary: '标记留言已读' })
  markRead(@Param('id') id: string) {
    return this.messageService.markRead(+id);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '删除留言' })
  remove(@Param('id') id: string) {
    return this.messageService.remove(+id);
  }
}
