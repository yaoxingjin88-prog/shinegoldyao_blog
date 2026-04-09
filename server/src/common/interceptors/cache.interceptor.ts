import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, tap } from 'rxjs';
import { Request } from 'express';

export const CACHE_TTL_KEY = 'cache_ttl';
export const CacheTTL = (seconds: number) =>
  SetMetadata(CACHE_TTL_KEY, seconds);

interface CacheEntry {
  data: any;
  expiry: number;
}

@Injectable()
export class ApiCacheInterceptor implements NestInterceptor {
  private cache = new Map<string, CacheEntry>();

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.method !== 'GET') {
      return next.handle();
    }

    const ttl = this.reflector.get<number>(
      CACHE_TTL_KEY,
      context.getHandler(),
    );
    if (!ttl) {
      return next.handle();
    }

    const key = request.originalUrl || request.url;
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return of(cached.data);
    }

    return next.handle().pipe(
      tap((data) => {
        this.cache.set(key, { data, expiry: Date.now() + ttl * 1000 });
        if (this.cache.size > 500) {
          const now = Date.now();
          for (const [k, v] of this.cache.entries()) {
            if (v.expiry < now) this.cache.delete(k);
          }
        }
      }),
    );
  }
}
