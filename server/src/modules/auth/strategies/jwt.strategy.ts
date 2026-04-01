import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: { sub: string; username: string }) {
    const user = await this.prisma.adminUser.findFirst({
      where: { id: BigInt(payload.sub), deleteTime: 0n, status: 1 },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在或已禁用');
    }
    return { id: payload.sub, username: payload.username };
  }
}
