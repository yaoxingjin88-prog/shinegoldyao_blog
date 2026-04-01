import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CreateExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { ExperienceService } from './experience.service';

@ApiTags('经历')
@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取经历列表' })
  findAll() {
    return this.experienceService.findAll();
  }

  @ApiBearerAuth()
  @Get('admin')
  @ApiOperation({ summary: '管理端获取全部经历' })
  findAllAdmin() {
    return this.experienceService.findAllAdmin();
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '新增经历' })
  create(@Body() dto: CreateExperienceDto) {
    return this.experienceService.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: '更新经历' })
  update(@Param('id') id: string, @Body() dto: UpdateExperienceDto) {
    return this.experienceService.update(+id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '删除经历' })
  remove(@Param('id') id: string) {
    return this.experienceService.remove(+id);
  }
}
