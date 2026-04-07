import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CreateMusicDto, UpdateMusicDto } from './dto/music.dto';
import { MusicService } from './music.service';

@ApiTags('音乐')
@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取音乐列表（公开，已启用）' })
  findAll() {
    return this.musicService.findAll();
  }

  @ApiBearerAuth()
  @Get('admin')
  @ApiOperation({ summary: '获取所有音乐（管理后台）' })
  findAllAdmin() {
    return this.musicService.findAllAdmin();
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '添加音乐' })
  create(@Body() dto: CreateMusicDto) {
    return this.musicService.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: '更新音乐' })
  update(@Param('id') id: string, @Body() dto: UpdateMusicDto) {
    return this.musicService.update(+id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '删除音乐' })
  remove(@Param('id') id: string) {
    return this.musicService.remove(+id);
  }
}
