import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty() @IsNotEmpty() @IsString() tagName: string;
  @ApiProperty() @IsNotEmpty() @IsString() slug: string;
  @ApiPropertyOptional() @IsOptional() @IsString() themeColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class UpdateTagDto extends PartialType(CreateTagDto) {}
