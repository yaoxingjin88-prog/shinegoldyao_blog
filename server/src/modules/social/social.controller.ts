import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CacheTTL } from '../../common/interceptors/cache.interceptor';
import { CreateSocialDto, UpdateSocialDto } from './dto/social.dto';
import { SocialService } from './social.service';

@ApiTags('社交链接')
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Public()
  @Get()
  @CacheTTL(120)
  @ApiOperation({ summary: '获取社交链接列表' })
  findAll() {
    return this.socialService.findAll();
  }

  @ApiBearerAuth()
  @Get('admin')
  @ApiOperation({ summary: '管理端获取全部社交链接' })
  findAllAdmin() {
    return this.socialService.findAllAdmin();
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '新增社交链接' })
  create(@Body() dto: CreateSocialDto) {
    return this.socialService.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: '更新社交链接' })
  update(@Param('id') id: string, @Body() dto: UpdateSocialDto) {
    return this.socialService.update(+id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '删除社交链接' })
  remove(@Param('id') id: string) {
    return this.socialService.remove(+id);
  }
}
