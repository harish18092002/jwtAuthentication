import { Injectable, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import { generateID } from '@jetit/id';
import { TLogin, TLoginReturn, TSignup } from './interface';
import { userInfo } from 'os';
import { AuthService } from './auth/auth.service';

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
      if (oldUser.rows[0])
        return {
          message: 'User already exists with details',
          User: oldUser.rows[0],
        };
      const userId = generateID('HEX', '01');
      const query =
        'INSERT INTO jwtusers (id ,username, password) VALUES ($1, $2 ,$3) RETURNING *';
      const password = await argon2.hash(data.password);
      const values = [userId, data.username, password];
      await this.pool.query(query, values);
      const tokenData = {
        username: data.username,
        password: password,
      };
      return {
        userId: userId,
        message: `User created successfully `,
        authToken: await this.jwtService.signAsync(tokenData),
      };
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  async loginUser(data: TLogin, token: string): Promise<TLoginReturn> {
    try {
      const authService = new AuthService();
      const headerToken = await authService.extractToken(token);
      if (!headerToken) return { message: 'Invalid token credentials' };
      const tokenCheck = await this.jwtService.verifyAsync(headerToken);
      const query = `SELECT * FROM jwtusers WHERE id =$1`;
      const values = [data.userId];
      const result = await this.pool.query(query, values);
      if (!result.rows || result.rows.length === 0)
        return { message: 'Incorrect credentials' };

      if (
        result.rows[0]?.username &&
        tokenCheck?.username &&
        result.rows[0].username === tokenCheck.username
      )
        return {
          message: 'User fetched successfully',
          userId: result.rows[0].id,
          username: result.rows[0].username,
        };

      return {
        message: 'User fetched and token does not match',
      };
    } catch (error) {
      throw new Error(`Error during login process: ${error}`);
    }
  }
}
