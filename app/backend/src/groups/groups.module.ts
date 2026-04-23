import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { GroupsController } from './groups.controller';
import { GroupMemberImportService } from './services/group-member-import.service';
import { GroupsService } from './groups.service';
import { Group, GroupSchema } from './schemas/group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService, GroupMemberImportService],
  exports: [GroupsService, GroupMemberImportService, MongooseModule],
})
export class GroupsModule {}
