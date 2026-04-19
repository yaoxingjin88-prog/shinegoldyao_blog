import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { BatchClickDto, CreateTrackDto, RageClickDto } from './dto/track.dto';
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

  @Public()
  @Post('click')
  @ApiOperation({ summary: '上报点击坐标（热力图采集）' })
  createClicks(@Body() dto: BatchClickDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '';
    return this.trackService.createClicks(dto, ip);
  }

  @ApiBearerAuth()
  @Get('heatmap')
  @ApiOperation({ summary: '获取热力图数据（指定路径）' })
  getHeatmap(@Query('path') path: string, @Query('limit') limit?: string) {
    return this.trackService.getHeatmap(path || '', limit ? +limit : 2000);
  }

  @Public()
  @Post('rage-click')
  @ApiOperation({ summary: '上报愤怒点击（Rage Click）事件' })
  reportRage(@Body() dto: RageClickDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '';
    return this.trackService.reportRageClick(
      dto.path || '',
      Math.min(Math.max(Number(dto.count) || 4, 4), 50),
      ip,
      { x: dto.x, y: dto.y, tag: dto.tag },
    );
  }

  @ApiBearerAuth()
  @Get('heatmap/paths')
  @ApiOperation({ summary: '获取有点击数据的路径列表' })
  getHeatmapPaths() {
    return this.trackService.getClickPaths();
  }
}
