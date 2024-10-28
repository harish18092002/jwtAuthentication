// database.module.ts
import { Module, Global, OnModuleInit, Inject } from '@nestjs/common';
import { Pool } from 'pg';

const dbUrl = new Pool({
  connectionString:
    process.env?.JWT_DB_URL ??
    'postgresql://postgres:root@localhost:5432/mydb?schema=public',
});

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useValue: dbUrl,
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule implements OnModuleInit {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async onModuleInit() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS jwtusers (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Database table initialized successfully');
    } catch (error) {
      console.error('Error initializing database table:', error);
      throw error;
    }
  }
}
