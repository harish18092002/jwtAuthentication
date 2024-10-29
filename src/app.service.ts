import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'mysql2/promise';

interface SignupData {
  username: string;
  password: string;
}

@Injectable()
export class AppService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async createUser(data: SignupData): Promise<string> {
    try {
      const query = 'INSERT INTO jwtusers (username, password) VALUES (?, ?)';
      const values = [data.username, data.password];

      const [result] = await this.pool.execute(query, values);
      console.log(`User created:`, result);

      return 'User created successfully';
    } catch (error) {
      console.error(`Error creating user:`, error);
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async loginUser(data: SignupData): Promise<any> {
    try {
      // Fixed: Changed $1, $2 to ? for MySQL style parameters
      const query =
        'SELECT * FROM jwtusers WHERE username = ? AND password = ?';
      const values = [data.username, data.password];

      // Using execute instead of query for better security with prepared statements
      const [rows] = await this.pool.execute(query, values);

      // Checking if rows is empty
      if (!rows || (Array.isArray(rows) && rows.length === 0)) {
        return 'Incorrect credentials';
      }

      return rows;
    } catch (error) {
      console.error(`Error during login process:`, error);
      throw new Error(`Error during login process: ${error.message}`);
    }
  }
}
