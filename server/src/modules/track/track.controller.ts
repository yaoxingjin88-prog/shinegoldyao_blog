import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CreateTrackDto } from './dto/track.dto';
import { TrackService } from './track.service';

@ApiTags('访问统计')
@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: '上报访问记录' })
  create(@Body() dto: CreateTrackDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '';
    const headerUA = req.headers['user-agent'] || '';
    return this.trackService.createTrack(dto, ip, headerUA);
  }

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: '查询访问日志（分页）' })
  findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.trackService.findAll(+page, +pageSize);
  }

  @ApiBearerAuth()
  @Get('stats')
  @ApiOperation({ summary: '获取访问统计数据' })
  getStats() {
    return this.trackService.getStats();
  }
}
