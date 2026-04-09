import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CacheTTL } from '../../common/interceptors/cache.interceptor';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { ProjectService } from './project.service';

@ApiTags('项目')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Public()
  @Get()
  @CacheTTL(60)
  @ApiOperation({ summary: '获取项目列表' })
  findAll() {
    return this.projectService.findAll();
  }

  @ApiBearerAuth()
  @Get('admin')
  @ApiOperation({ summary: '管理端获取全部项目' })
  findAllAdmin() {
    return this.projectService.findAllAdmin();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取项目详情' })
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '新增项目' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: '更新项目' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(+id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '删除项目' })
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
