import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CreateSkillCategoryDto, CreateSkillDto, UpdateSkillCategoryDto, UpdateSkillDto } from './dto/skill.dto';
import { SkillService } from './skill.service';

@ApiTags('技术栈')
@Controller('skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: '获取技术分类（含技能列表）' })
  findCategories() {
    return this.skillService.findCategories();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: '获取技术列表' })
  @ApiQuery({ name: 'categoryId', required: false })
  findSkills(@Query('categoryId') categoryId?: string) {
    return this.skillService.findSkills(categoryId ? +categoryId : undefined);
  }

  @ApiBearerAuth()
  @Post('category')
  @ApiOperation({ summary: '新增技术分类' })
  createCategory(@Body() dto: CreateSkillCategoryDto) {
    return this.skillService.createCategory(dto);
  }

  @ApiBearerAuth()
  @Put('category/:id')
  @ApiOperation({ summary: '更新技术分类' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateSkillCategoryDto) {
    return this.skillService.updateCategory(+id, dto);
  }

  @ApiBearerAuth()
  @Delete('category/:id')
  @ApiOperation({ summary: '删除技术分类' })
  removeCategory(@Param('id') id: string) {
    return this.skillService.removeCategory(+id);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '新增技术' })
  createSkill(@Body() dto: CreateSkillDto) {
    return this.skillService.createSkill(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: '更新技术' })
  updateSkill(@Param('id') id: string, @Body() dto: UpdateSkillDto) {
    return this.skillService.updateSkill(+id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '删除技术' })
  removeSkill(@Param('id') id: string) {
    return this.skillService.removeSkill(+id);
  }
}
