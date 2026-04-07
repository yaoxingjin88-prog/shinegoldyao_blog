import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateCommentDto {
  @ApiProperty() @IsNotEmpty() @Type(() => Number) @IsInt() articleId: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() parentId?: number;
  @ApiProperty() @IsNotEmpty() @IsString() @MaxLength(50) nickname: string;
  @ApiProperty() @IsNotEmpty() @IsEmail() email: string;
  @ApiProperty() @IsNotEmpty() @IsString() @MaxLength(2000) content: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) website?: string;
}

export class QueryCommentDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() articleId?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isApproved?: number;
}
