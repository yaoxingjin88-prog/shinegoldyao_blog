import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CacheTTL } from '../../common/interceptors/cache.interceptor';
import { CreateToolCategoryDto, UpdateToolCategoryDto, CreateToolItemDto, UpdateToolItemDto } from './dto/tool.dto';
import { ToolService } from './tool.service';

@ApiTags('工具导航')
@Controller('tool')
export class ToolController {
  constructor(private readonly toolService: ToolService) {}

  // ---- 前台 ----
  @Public()
  @Get()
  @CacheTTL(120)
  @ApiOperation({ summary: '获取工具导航（前台）' })
  findAllPublic() {
    return this.toolService.findAllPublic();
  }

  // ---- 管理端：分类 ----
  @ApiBearerAuth()
  @Get('category/admin')
  @ApiOperation({ summary: '获取全部工具分类（管理端）' })
  findAllCategoriesAdmin() {
    return this.toolService.findAllCategoriesAdmin();
  }

  @ApiBearerAuth()
  @Post('category')
  @ApiOperation({ summary: '新增工具分类' })
  createCategory(@Body() dto: CreateToolCategoryDto) {
    return this.toolService.createCategory(dto);
  }

  @ApiBearerAuth()
  @Put('category/:id')
  @ApiOperation({ summary: '更新工具分类' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateToolCategoryDto) {
    return this.toolService.updateCategory(+id, dto);
  }

  @ApiBearerAuth()
  @Delete('category/:id')
  @ApiOperation({ summary: '删除工具分类' })
  removeCategory(@Param('id') id: string) {
    return this.toolService.removeCategory(+id);
  }

  // ---- 管理端：工具项 ----
  @ApiBearerAuth()
  @Get('item/admin')
  @ApiOperation({ summary: '获取全部工具项（管理端）' })
  findAllItemsAdmin() {
    return this.toolService.findAllItemsAdmin();
  }

  @ApiBearerAuth()
  @Post('item')
  @ApiOperation({ summary: '新增工具' })
  createItem(@Body() dto: CreateToolItemDto) {
    return this.toolService.createItem(dto);
  }

  @ApiBearerAuth()
  @Put('item/:id')
  @ApiOperation({ summary: '更新工具' })
  updateItem(@Param('id') id: string, @Body() dto: UpdateToolItemDto) {
    return this.toolService.updateItem(+id, dto);
  }

  @ApiBearerAuth()
  @Delete('item/:id')
  @ApiOperation({ summary: '删除工具' })
  removeItem(@Param('id') id: string) {
    return this.toolService.removeItem(+id);
  }
}
