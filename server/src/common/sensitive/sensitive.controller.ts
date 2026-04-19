import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { SensitiveService } from './sensitive.service';

@ApiTags('敏感词过滤')
@Controller('sensitive')
export class SensitiveController {
  constructor(private readonly svc: SensitiveService) {}

  @Public()
  @Post('check')
  @ApiOperation({ summary: '检测文本是否含敏感词（公开，用于前端输入校验）' })
  check(@Body() body: { text: string }) {
    return this.svc.check(body?.text || '');
  }

  @ApiBearerAuth()
  @Get('stats')
  @ApiOperation({ summary: '敏感词库统计信息' })
  stats() {
    return this.svc.stats();
  }

  @ApiBearerAuth()
  @Get('words')
  @ApiOperation({ summary: '获取自定义敏感词列表' })
  listWords() {
    return this.svc.listCustomWords();
  }

  @ApiBearerAuth()
  @Post('words')
  @ApiOperation({ summary: '新增自定义敏感词（支持批量）' })
  addWords(@Body() body: { words: string[] | string }) {
    const words = Array.isArray(body?.words) ? body.words : [body?.words || ''];
    this.svc.addWords(words.filter(Boolean));
    return { success: true, added: words.length };
  }

  @ApiBearerAuth()
  @Delete('words/:word')
  @ApiOperation({ summary: '删除自定义敏感词' })
  removeWord(@Param('word') word: string) {
    this.svc.removeWord(word);
    return { success: true };
  }
}
