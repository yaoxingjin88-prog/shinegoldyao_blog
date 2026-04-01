import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}

export class QueryArticleDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() categoryId?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() tagId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() keyword?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isTop?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isPublish?: number;
}
