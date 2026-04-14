import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { ChatRequestDto } from './dto/chat.dto';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private readonly apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async streamChat(dto: ChatRequestDto, req: Request, res: Response): Promise<void> {
    const apiKey = this.configService.get<string>('dashscopeApiKey');
    if (!apiKey) {
      res.status(500).json({ code: 1, message: 'AI 服务未配置 API Key' });
      return;
    }

    const systemMessage = {
      role: 'system' as const,
      content:
        '你是 ShineGoldYao 技术博客的 AI 助手，名叫「航行者」。你擅长解答编程、前端、后端、全栈开发等技术问题。请用简洁、专业、友好的语气回答问题。如果涉及代码，请使用 Markdown 代码块格式。',
    };

    const messages = [systemMessage, ...dto.messages];
    const model = dto.model || 'qwen-turbo';

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const lastUserMsg = dto.messages.filter((m) => m.role === 'user').pop();
    this.prisma.aiChatLog.create({
      data: { ip, userAgent, question: lastUserMsg?.content || '', model },
    }).catch((err) => this.logger.error('Save chat log error', err));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, stream: true }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Qwen API error: ${response.status} ${errorText}`);
        res.write(`data: ${JSON.stringify({ error: 'AI 服务请求失败' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          // Forward SSE data directly to client
          res.write(trimmed + '\n\n');
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith('data: ')) {
          res.write(trimmed + '\n\n');
        }
      }

      res.end();
    } catch (error) {
      this.logger.error('Stream chat error', error);
      res.write(`data: ${JSON.stringify({ error: '连接 AI 服务失败' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }

  async findAll(query: { page?: number; pageSize?: number }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const [list, total] = await Promise.all([
      this.prisma.aiChatLog.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createTime: 'desc' },
      }),
      this.prisma.aiChatLog.count(),
    ]);
    return { list, total, page, pageSize };
  }
}
