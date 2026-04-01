import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateMessageDto {
  @ApiProperty() @IsNotEmpty() @IsString() @MaxLength(50) nickname: string;
  @ApiProperty() @IsNotEmpty() @IsEmail() email: string;
  @ApiProperty() @IsNotEmpty() @IsString() @MaxLength(1000) content: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) contact?: string;
}

export class QueryMessageDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() isRead?: number;
}
