import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'mysql2';
const logger = new Logger('JWT-User-Service');

@Injectable()
export class AppService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}
  async createUser(username: string, password: string) {
    try {
      const query =
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
      const values = [username, password];
      logger.error(username, password);
      const result = await this.pool.query(query, values);

      return result;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }
  getHello(): string {
    return 'Hello World!';
  }
}
