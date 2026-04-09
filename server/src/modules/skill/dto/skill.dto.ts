import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSkillCategoryDto {
  @ApiProperty() @IsNotEmpty() @IsString() categoryName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() themeColor?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() sort?: number;
}

export class UpdateSkillCategoryDto extends PartialType(CreateSkillCategoryDto) {}

export class CreateSkillDto {
  @ApiProperty() @IsNotEmpty() @Type(() => Number) @IsInt() @Min(1) categoryId: number;
  @ApiProperty() @IsNotEmpty() @IsString() skillName: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) proficiency?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() iconUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() sort?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(1) isEnable?: number;
}

export class UpdateSkillDto extends PartialType(CreateSkillDto) {}
