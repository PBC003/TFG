import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'uo289642_user',
  password: process.env.DB_PASSWORD ?? 'uo289642_db_password',
  database: process.env.DB_NAME ?? 'uo289642_name',
  logging: process.env.DB_LOGGING === 'true',
}));
