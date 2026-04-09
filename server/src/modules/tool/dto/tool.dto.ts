import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateToolCategoryDto {
  @ApiProperty() @IsNotEmpty() @IsString() categoryName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() icon?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bgClass?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() iconClass?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() sort?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isEnable?: number;
}

export class UpdateToolCategoryDto extends PartialType(CreateToolCategoryDto) {}

export class CreateToolItemDto {
  @ApiProperty() @IsNotEmpty() @Type(() => Number) @IsInt() categoryId: number;
  @ApiProperty() @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emoji?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() url?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() sort?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isEnable?: number;
}

export class UpdateToolItemDto extends PartialType(CreateToolItemDto) {}
