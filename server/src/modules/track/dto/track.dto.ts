import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrackDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class ClickPoint {
  @ApiPropertyOptional() @IsOptional() @IsNumber() x: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() y: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() w?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() h?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() tag?: string;
}

export class BatchClickDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ type: [ClickPoint] })
  @IsArray()
  clicks: ClickPoint[];
}

export class RageClickDto {
  @ApiPropertyOptional() @IsOptional() @IsString() path?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() count?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() x?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() y?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() tag?: string;
}
