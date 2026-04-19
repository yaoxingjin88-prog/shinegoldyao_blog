import { Injectable } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

/**
 * 业务事件推送语义封装：各业务模块只需注入该 Service，
 * 通过 pushXxx 方法推送事件，无需了解 WebSocket 细节。
 */
export type AdminEvent =
  | 'visit'
  | 'like'
  | 'comment'
  | 'message'
  | 'rage_click'
  | 'article_published';

export interface AdminEventPayload {
  id: string;
  type: AdminEvent;
  title: string;
  content: string;
  level: 'info' | 'success' | 'warning' | 'danger';
  meta?: Record<string, any>;
  time: number;
}

@Injectable()
export class EventsService {
  constructor(private readonly gateway: EventsGateway) {}

  /** 访客访问页面 */
  pushVisit(path: string, meta?: { ip?: string; device?: string; browser?: string; os?: string }) {
    this.push({
      type: 'visit',
      title: '新访客到达',
      content: `有访客正在访问 ${path || '/'}`,
      level: 'info',
      meta,
    });
  }

  /** 文章点赞 */
  pushLike(articleTitle: string, likeCount: number, meta?: Record<string, any>) {
    this.push({
      type: 'like',
      title: '文章收获新点赞',
      content: `《${articleTitle}》获得了新的点赞，当前 ${likeCount} 赞`,
      level: 'success',
      meta,
    });
  }

  /** 新评论 */
  pushComment(articleTitle: string, nickname: string, content: string) {
    this.push({
      type: 'comment',
      title: '新评论',
      content: `${nickname} 评论了《${articleTitle}》：${content.substring(0, 40)}`,
      level: 'success',
      meta: { articleTitle, nickname },
    });
  }

  /** 新留言 */
  pushMessage(nickname: string, content: string) {
    this.push({
      type: 'message',
      title: '新留言',
      content: `${nickname} 给你发了一条留言：${content.substring(0, 40)}`,
      level: 'success',
      meta: { nickname },
    });
  }

  /** 愤怒点击（Rage Click）告警 */
  pushRageClick(path: string, count: number, meta?: Record<string, any>) {
    this.push({
      type: 'rage_click',
      title: '⚠️ 检测到愤怒点击',
      content: `用户在 ${path} 短时间内疯狂点击了 ${count} 次，可能遇到交互问题`,
      level: 'danger',
      meta,
    });
  }

  /** 通用推送入口 */
  push(e: Omit<AdminEventPayload, 'id' | 'time'>) {
    const payload: AdminEventPayload = {
      ...e,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      time: Date.now(),
    };
    this.gateway.broadcast('notify', payload);
  }

  getOnlineAdminCount() {
    return this.gateway.getOnlineAdminCount();
  }
}
