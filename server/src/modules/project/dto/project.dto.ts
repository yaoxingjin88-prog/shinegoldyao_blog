import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty() @IsNotEmpty() @IsString() projectName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coverUrl?: string;
  @ApiProperty() @IsNotEmpty() @IsString() shortDesc: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fullDesc?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() techStack?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() demoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() githubUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() giteeUrl?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() sort?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isShow?: number;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
