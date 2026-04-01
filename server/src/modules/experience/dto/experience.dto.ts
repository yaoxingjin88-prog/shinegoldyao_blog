import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateExperienceDto {
  @ApiProperty({ description: '类型：1=教育 2=工作' }) @IsNotEmpty() @Type(() => Number) @IsInt() @Min(1) @Max(2) type: number;
  @ApiProperty() @IsNotEmpty() @IsString() orgName: string;
  @ApiProperty() @IsNotEmpty() @IsString() position: string;
  @ApiProperty() @IsNotEmpty() @IsDateString() startDate: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() sort?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isShow?: number;
}

export class UpdateExperienceDto extends PartialType(CreateExperienceDto) {}
