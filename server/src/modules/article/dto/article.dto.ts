import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateArticleDto {
  @ApiProperty() @IsNotEmpty() @IsString() title: string;
  @ApiProperty() @IsNotEmpty() @IsString() slug: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coverUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() summary?: string;
  @ApiProperty() @IsNotEmpty() @IsString() content: string;
  @ApiPropertyOptional() @IsOptional() @IsString() htmlContent?: string;
  @ApiProperty() @IsNotEmpty() @Type(() => Number) @IsInt() categoryId: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isTop?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isPublish?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() seoKeywords?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoDescription?: string;
  @ApiPropertyOptional({ type: [Number] }) @IsOptional() @IsArray() tagIds?: number[];

  /** 是否启用 AI 自动补全空缺字段（summary/seoKeywords/seoDescription/tags） */
  @ApiPropertyOptional({ description: 'AI 自动补全缺失的摘要/关键词/标签', default: false })
  @IsOptional()
  @IsBoolean()
  aiAutoFill?: boolean;
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}

export class AiGenerateDto {
  @ApiProperty() @IsNotEmpty() @IsString() title: string;
  @ApiProperty() @IsNotEmpty() @IsString() content: string;
}

export class AiExplainDto {
  @ApiProperty({ description: '需要解释的术语或选中文本' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: '上下文（文章标题或段落）' })
  @IsOptional()
  @IsString()
  context?: string;
}

export class AiWriteAssistDto {
  @ApiProperty({ description: '选中的文本' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({ description: '操作类型', enum: ['polish', 'rewrite', 'continue', 'condense'] })
  @IsNotEmpty()
  @IsString()
  action: 'polish' | 'rewrite' | 'continue' | 'condense';

  @ApiPropertyOptional({ description: '文章标题（上下文）' })
  @IsOptional()
  @IsString()
  context?: string;
}

export class QueryArticleDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() categoryId?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() tagId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() keyword?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isTop?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isPublish?: number;
}
