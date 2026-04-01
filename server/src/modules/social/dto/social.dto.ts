import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSocialDto {
  @ApiProperty() @IsNotEmpty() @IsString() platformName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() iconUrl?: string;
  @ApiProperty() @IsNotEmpty() @IsString() linkUrl: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() sort?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isShow?: number;
}

export class UpdateSocialDto extends PartialType(CreateSocialDto) {}
