import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSession } from './entities/auth-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthSession])],
  exports: [TypeOrmModule],
})
export class AuthModule {}
