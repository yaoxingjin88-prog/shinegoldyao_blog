import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SiteConfigItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty()
  @IsString()
  value: string;
}

export class UpdateSiteConfigDto {
  @ApiProperty({ description: '配置项列表', type: [SiteConfigItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiteConfigItemDto)
  configs: SiteConfigItemDto[];
}

export class CreateSiteConfigDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  configKey: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  configValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
