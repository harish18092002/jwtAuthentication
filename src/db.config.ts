import { Module, Global } from '@nestjs/common';
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
export class DatabaseModule {}
