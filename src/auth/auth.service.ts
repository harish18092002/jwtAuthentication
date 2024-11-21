import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async extractToken(headerToken: string) {
    const [type, token] = headerToken.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
