import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBannerDto {
  @ApiPropertyOptional({ description: '标题' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '图片地址' })
  @IsOptional() @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: '渐变背景色（亮色模式）' })
  @IsOptional() @IsString()
  bgColor?: string;

  @ApiPropertyOptional({ description: '渐变背景色（暗黑模式）' })
  @IsOptional() @IsString()
  bgColorDark?: string;

  @ApiPropertyOptional({ description: '跳转链接', default: '#' })
  @IsOptional() @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ description: '排序值（越大越靠前）', default: 0 })
  @IsOptional() @Type(() => Number) @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '是否启用：0禁用 1启用', default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(1)
  isEnable?: number;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
