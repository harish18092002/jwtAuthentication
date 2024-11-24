import {
  Injectable,
  Inject,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import { generateID } from '@jetit/id';
import { TLogin, TLoginReturn, TSignup } from './interface';

@Injectable()
export class AppService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    private jwtService: JwtService,
  ) {}

  async createUser(data: TSignup) {
    try {
      const oldUserQuery = `SELECT * FROM jwtusers WHERE username=$1`;
      const oldUserValues = [data.username];
      const oldUser = await this.pool.query(oldUserQuery, oldUserValues);

      if (oldUser.rows[0]) {
        return {
          message: 'User already exists with details',
          User: oldUser.rows[0],
        };
      }

      const userId = generateID('HEX', '01');
      const password = await argon2.hash(data.password);

      const query =
        'INSERT INTO jwtusers (id, username, password) VALUES ($1, $2, $3) RETURNING *';
      const values = [userId, data.username, password];
      const newUser = await this.pool.query(query, values);

      const tokenPayload = {
        sub: userId,
        username: data.username,
        iat: Math.floor(Date.now() / 1000),
      };

      const token = await this.jwtService.signAsync(tokenPayload);

      return {
        userId: userId,
        message: 'User created successfully',
        authToken: token,
      };
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  async loginUser(data: TLogin, token: string): Promise<TLoginReturn> {
    try {
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const headerToken = token.replace('Bearer ', '');

      try {
        const tokenPayload = await this.jwtService.verifyAsync(headerToken, {
          ignoreExpiration: false,
        });

        const query = `SELECT * FROM jwtusers WHERE id = $1`;
        const values = [data.userId];
        const result = await this.pool.query(query, values);

        if (!result.rows || result.rows.length === 0) {
          throw new UnauthorizedException('User not found');
        }

        const user = result.rows[0];

        if (
          user.username !== tokenPayload.username ||
          user.id !== tokenPayload.sub
        ) {
          throw new UnauthorizedException('Token does not match user');
        }

        return {
          message: 'User fetched successfully',
          userId: user.id,
          username: user.username,
        };
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        }
        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Error during login process: ${error}`);
    }
  }
}
