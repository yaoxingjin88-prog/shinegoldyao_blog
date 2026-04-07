import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMusicDto {
  @ApiProperty() @IsNotEmpty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() artist?: string;
  @ApiProperty() @IsNotEmpty() @IsString() url: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coverUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gradient?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() sort?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isEnable?: number;
}

export class UpdateMusicDto extends PartialType(CreateMusicDto) {}
