import type { TokenGenerator } from '@application/auth/token-generator.interface';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  async generate(payload: { sub: string; email: string }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
