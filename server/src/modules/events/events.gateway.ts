import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

/**
 * 后台实时监控舱 WebSocket Gateway
 *
 * - 独立命名空间 `/admin`，仅管理员可连接（握手时校验 JWT）
 * - 广播事件类型：visit / like / comment / message / rage_click
 * - 前端通过 socket.io-client 订阅，实现通知铃铛实时弹窗
 */
@WebSocketGateway({
  namespace: '/admin',
  cors: { origin: true, credentials: true },
  transports: ['websocket', 'polling'],
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService) {}

  afterInit() {
    this.logger.log('[WS] EventsGateway initialized @ /admin namespace');
  }

  handleConnection(client: Socket) {
    // 从 auth / query / header 三处任一提取 token
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.query?.token as string) ||
      (client.handshake.headers['authorization'] as string)?.replace(/^Bearer\s+/i, '') ||
      '';

    if (!token) {
      this.logger.warn(`[WS] reject connection ${client.id}: no token`);
      client.emit('unauthorized', { message: '未提供访问令牌' });
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwt.verify(token);
      (client.data as any).user = payload;
      this.logger.log(`[WS] admin connected: ${client.id} (uid=${payload.sub || payload.userId || '?'})`);
      client.emit('connected', { ok: true, serverTime: Date.now() });
    } catch (err) {
      this.logger.warn(`[WS] reject connection ${client.id}: invalid token`);
      client.emit('unauthorized', { message: '令牌无效或已过期' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[WS] admin disconnected: ${client.id}`);
  }

  /** 统计当前在线管理端数量 */
  getOnlineAdminCount(): number {
    // server 在 gateway 中指向当前命名空间，其 sockets 是 Map-like
    const sockets: any = this.server?.sockets;
    if (!sockets) return 0;
    if (typeof sockets.size === 'number') return sockets.size;
    if (sockets instanceof Map) return sockets.size;
    return 0;
  }

  /** 广播通用事件到所有已连接的管理端 */
  broadcast(event: string, payload: unknown) {
    if (!this.server) return;
    this.server.emit(event, payload);
  }
}
