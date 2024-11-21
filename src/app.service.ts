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
      // const oldUser = await this.loginUser(data);
      // if (oldUser) return { msg: `User data already exists`, data: oldUser };
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
      Logger.error(headerToken);
      if (!headerToken) return { message: 'Invalid token credentials' };
      const tokenCheck = await this.jwtService.verifyAsync(headerToken);

      console.log('Token validations result is : ', tokenCheck);

      const query = `SELECT * FROM jwtusers WHERE id =$1`;
      const values = [data.userId];

      const result = await this.pool.query(query, values);
      console.log(result.rows);

      if (!result.rows || result.rows.length === 0) {
        return { message: 'Incorrect credentials' };
      }
      return {
        message: 'User fetched successfully',
        userId: result.rows[0].id,
        username: result.rows[0].username,
      };
    } catch (error) {
      throw new Error(`Error during login process: ${error}`);
    }
  }
}
