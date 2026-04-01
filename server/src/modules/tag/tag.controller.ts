import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';
import { TagService } from './tag.service';

@ApiTags('文章标签')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取标签列表' })
  findAll() {
    return this.tagService.findAll();
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '新增标签' })
  create(@Body() dto: CreateTagDto) {
    return this.tagService.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: '更新标签' })
  update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.tagService.update(+id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '删除标签' })
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}
