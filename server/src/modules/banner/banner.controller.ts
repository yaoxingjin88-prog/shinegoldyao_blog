import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { BannerService } from './banner.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

@ApiTags('轮播图')
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取启用的轮播图列表' })
  findAll() {
    return this.bannerService.findAll();
  }

  @ApiBearerAuth()
  @Get('admin')
  @ApiOperation({ summary: '管理端获取全部轮播图' })
  findAllAdmin() {
    return this.bannerService.findAllAdmin();
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '新增轮播图' })
  create(@Body() dto: CreateBannerDto) {
    return this.bannerService.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: '更新轮播图' })
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannerService.update(+id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '删除轮播图' })
  remove(@Param('id') id: string) {
    return this.bannerService.remove(+id);
  }
}
