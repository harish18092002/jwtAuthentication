import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'mysql2';

@Injectable()
export class AppService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async createUser(data: signup): Promise<string> {
    try {
      const query =
        'INSERT INTO jwtusers (username, password) VALUES ($1, $2) RETURNING *';
      const values = [data.username, data.password];

      const result = await this.pool.query(query, values);
      console.log(`User created: ${result}`);

      return 'User created successfully';
    } catch (error) {
      console.error(`Error creating user: ${error.message}`);
      throw new Error(`Error creating user: ${error.message}`);
    }
  }
  async loginUser(data: signup) {
    try {
      const query = `SELECT * FROM jwtusers WHERE username=$1 AND password=$2`;
      const values = [data.username, data.password];
      const result = await this.pool.query(query, values);
      return result;
    } catch (e) {
      console.error(e);
      throw new Error(`Error during login process : ${e}`);
    }
    return 'Successfully logged In';
  }
}
