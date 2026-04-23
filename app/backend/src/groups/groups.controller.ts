import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUser } from '../auth/auth.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { CreateGroupDto } from './dto/create-group.dto';
import { ImportGroupMembersDto } from './dto/import-group-members.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';
import type {
  GroupImportResult,
  GroupItem,
  GroupStudentOption,
} from './types/group.types';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.TEACHER)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async listGroups(
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ groups: GroupItem[] }> {
    const groups = await this.groupsService.listGroups(request.user);
    return { groups };
  }

  @Get('student-options')
  async listStudentOptions(): Promise<{ students: GroupStudentOption[] }> {
    const students = await this.groupsService.listStudentOptions();
    return { students };
  }

  @Post()
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ group: GroupItem }> {
    const group = await this.groupsService.createGroup(
      createGroupDto,
      request.user,
    );
    return { group };
  }

  @Post('import-members')
  async importGroupMembers(
    @Body() importGroupMembersDto: ImportGroupMembersDto,
  ): Promise<{ result: GroupImportResult }> {
    const result = await this.groupsService.importGroupMembers(
      importGroupMembersDto.rawText,
    );
    return { result };
  }

  @Patch(':groupId')
  async updateGroup(
    @Param('groupId') groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Req() request: Request & { user: PublicUser },
  ): Promise<{ group: GroupItem }> {
    const group = await this.groupsService.updateGroup(
      groupId,
      updateGroupDto,
      request.user,
    );
    return { group };
  }

  @Delete(':groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async archiveGroup(
    @Param('groupId') groupId: string,
    @Req() request: Request & { user: PublicUser },
  ): Promise<void> {
    await this.groupsService.archiveGroup(groupId, request.user);
  }
}
