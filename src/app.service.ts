import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';

interface SignupData {
  username: string;
  password: string;
}

@Injectable()
export class AppService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    private jwtService: JwtService,
  ) {}
  async createUser(data: SignupData) {
    try {
      // const oldUser = await this.loginUser(data);
      // if (oldUser) return { msg: `User data already exists`, data: oldUser };
      const query =
        'INSERT INTO jwtusers (username, password) VALUES ($1, $2) RETURNING *';
      const values = [data.username, data.password];

      const result = await this.pool.query(query, values);
      console.log(`User created:`, result.rows[0]);

      return `User created successfully : ${this.jwtService.sign(data)}`;
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  async loginUser(data: SignupData): Promise<any> {
    try {
      const query =
        'SELECT * FROM jwtusers WHERE username = $1 AND password = $2';
      const values = [data.username, data.password];
      const result = await this.pool.query(query, values);

      if (!result.rows || result.rows.length === 0) {
        return 'Incorrect credentials';
      }

      // 1.First extract only the needed data
      // 2.Then use jwt to signup

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error during login process: ${error}`);
    }
  }
}
