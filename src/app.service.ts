import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import { generateID } from '@jetit/id';
import { TLogin, TSignup } from './interface';
import { userInfo } from 'os';

interface signupData {
  userId: string;
  userToken?: string;
  username?: string;
  password?: string;
}

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
      const userId = generateID('HEX');

      const query =
        'INSERT INTO jwtusers (id ,username, password) VALUES ($1, $2 ,$3) RETURNING *';
      const password = await argon2.hash(data.password);
      const values = [userId, data.username, password];

      const result = await this.pool.query(query, values);
      console.log(`User created:`, result.rows[0]);

      return {
        userId: userId,
        message: `User created successfully `,
        authToken: this.jwtService.sign(data),
      };
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  async loginUser(data: TLogin): Promise<any> {
    try {
      const query = `SELECT * FROM jwtusers WHERE id =$1`;
      const values = [data.userId];

      const result = await this.pool.query(query, values);
      console.log(result.rows);

      if (!result.rows || result.rows.length === 0) {
        return 'Incorrect credentials';
      }
      return {
        message: 'User fetched successfully',
        userDetails: result.rows[0],
      };
    } catch (error) {
      throw new Error(`Error during login process: ${error}`);
    }
  }
}
