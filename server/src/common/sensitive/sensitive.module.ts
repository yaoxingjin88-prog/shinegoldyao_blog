import { Global, Module } from '@nestjs/common';
import { SensitiveService } from './sensitive.service';
import { SensitiveController } from './sensitive.controller';

/**
 * 敏感词全局模块
 * 使用 @Global() 装饰器后，任何业务 Module 无需再 import 即可直接注入 SensitiveService
 */
@Global()
@Module({
  providers: [SensitiveService],
  controllers: [SensitiveController],
  exports: [SensitiveService],
})
export class SensitiveModule {}
