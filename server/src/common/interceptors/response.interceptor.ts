import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  // 递归转换 BigInt 为 number
  private serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.serializeBigInt(item));
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key of Object.keys(obj)) {
        result[key] = this.serializeBigInt(obj[key]);
      }
      return result;
    }
    return obj;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'ok',
        data: this.serializeBigInt(data),
      })),
    );
  }
}
