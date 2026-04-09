import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CacheTTL } from '../../common/interceptors/cache.interceptor';
import { UpdateSiteConfigDto } from './dto/site.dto';
import { SiteService } from './site.service';

@ApiTags('网站配置')
@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Public()
  @Get('config')
  @CacheTTL(120)
  @ApiOperation({ summary: '获取网站配置' })
  getConfig() {
    return this.siteService.getConfig();
  }

  @ApiBearerAuth()
  @Put('config')
  @ApiOperation({ summary: '批量更新网站配置' })
  updateConfig(@Body() dto: UpdateSiteConfigDto) {
    return this.siteService.updateConfig(dto);
  }
}
