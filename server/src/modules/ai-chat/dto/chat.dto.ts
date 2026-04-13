import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ description: '角色', enum: ['user', 'assistant', 'system'] })
  @IsString()
  role: 'user' | 'assistant' | 'system';

  @ApiProperty({ description: '消息内容' })
  @IsString()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({ description: '对话消息列表', type: [ChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiProperty({ description: '模型名称', required: false, default: 'qwen-turbo' })
  @IsOptional()
  @IsString()
  model?: string;
}
