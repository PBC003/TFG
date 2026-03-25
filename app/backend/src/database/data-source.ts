import 'dotenv/config';
import { DataSource } from 'typeorm';
import { AuthSession } from '../auth/entities/auth-session.entity';
import { User } from '../users/entities/user.entity';

export default new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'uo289642_user',
  password: process.env.DB_PASSWORD ?? 'uo289642_db_password',
  database: process.env.DB_NAME ?? 'uo289642_name',
  entities: [User, AuthSession],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
