import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { In, Repository } from 'typeorm';
import type { PublicUser } from '../auth/auth.service';
import { createAppErrorBody } from '../common/errors/app-http.exception';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupMemberImportService } from './services/group-member-import.service';
import { Group, type GroupDocument } from './schemas/group.schema';
import type {
  GroupImportResult,
  GroupItem,
  GroupStudentOption,
} from './types/group.types';
import { toGroupItem, toGroupStudentOption } from './utils/group-item.util';
import { buildGroupVisibilityFilter } from './utils/group-visibility.util';
import {
  normalizeGroupMutationPayload,
  type GroupBadRequestThrower,
} from './utils/group-validation.util';

export type AuthorizedGroupUser = Pick<PublicUser, 'id' | 'role'>;

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly groupMemberImportService: GroupMemberImportService,
  ) {}

  async createGroup(
    createGroupDto: CreateGroupDto,
    user: AuthorizedGroupUser,
  ): Promise<GroupItem> {
    const normalizedPayload = await this.normalizeMutationPayload(
      createGroupDto,
      user,
    );

    const group = await this.groupModel.create({
      ...normalizedPayload,
      createdByUserId: user.id,
      updatedByUserId: user.id,
    });

    const studentsById = await this.loadStudentsById(group.memberUserIds);
    return toGroupItem(group, studentsById);
  }

  async listGroups(user: AuthorizedGroupUser): Promise<GroupItem[]> {
    const groups = await this.groupModel
      .find(buildGroupVisibilityFilter(user))
      .sort({ updatedAt: -1, createdAt: -1 })
      .exec();

    const studentsById = await this.loadStudentsById(
      groups.flatMap((group) => group.memberUserIds),
    );

    return groups.map((group) => toGroupItem(group, studentsById));
  }

  async listStudentOptions(): Promise<GroupStudentOption[]> {
    const students = await this.userRepository.find({
      where: { role: Role.STUDENT, isActive: true },
      order: { lastName: 'ASC', firstName: 'ASC' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        uo: true,
      },
    });

    return students.map(toGroupStudentOption);
  }

  async importGroupMembers(rawText: string): Promise<GroupImportResult> {
    return this.groupMemberImportService.importGroupMembers(rawText);
  }

  async updateGroup(
    groupId: string,
    updateGroupDto: UpdateGroupDto,
    user: AuthorizedGroupUser,
  ): Promise<GroupItem> {
    const group = await this.findVisibleGroupDocumentOrThrow(groupId, user);

    if (Object.keys(updateGroupDto).length === 0) {
      this.throwBadRequest(
        'common.bad_request',
        'At least one group field must be provided',
      );
    }

    const normalizedPayload = await this.normalizeMutationPayload(
      updateGroupDto,
      user,
      group,
    );

    group.name = normalizedPayload.name;
    group.description = normalizedPayload.description;
    group.memberUserIds = normalizedPayload.memberUserIds;
    group.updatedByUserId = user.id;
    group.version += 1;

    await group.save();

    const studentsById = await this.loadStudentsById(group.memberUserIds);
    return toGroupItem(group, studentsById);
  }

  async archiveGroup(
    groupId: string,
    user: AuthorizedGroupUser,
  ): Promise<void> {
    const group = await this.findVisibleGroupDocumentOrThrow(groupId, user);

    group.isArchived = true;
    group.archivedAt = new Date();
    group.archivedByUserId = user.id;
    group.updatedByUserId = user.id;
    group.version += 1;

    await group.save();
  }

  async findVisibleGroupDocumentOrThrow(
    groupId: string,
    user: AuthorizedGroupUser,
  ): Promise<GroupDocument> {
    const group = await this.groupModel
      .findOne({
        groupId,
        ...buildGroupVisibilityFilter(user),
      })
      .exec();

    if (!group) {
      this.throwNotFound();
    }

    return group;
  }

  private async normalizeMutationPayload(
    payload: CreateGroupDto | UpdateGroupDto,
    user: AuthorizedGroupUser,
    currentGroup?: GroupDocument,
  ): Promise<Pick<Group, 'name' | 'description' | 'memberUserIds'>> {
    const throwBadRequest: GroupBadRequestThrower = (code, message) =>
      this.throwBadRequest(code, message);

    const normalizedPayload = normalizeGroupMutationPayload(
      payload,
      currentGroup,
      throwBadRequest,
    );

    await this.assertGroupNameIsAvailable(
      normalizedPayload.name,
      user,
      currentGroup,
    );
    await this.assertStudentUsersExist(normalizedPayload.memberUserIds);

    return normalizedPayload;
  }

  private async assertGroupNameIsAvailable(
    name: string,
    user: AuthorizedGroupUser,
    currentGroup?: GroupDocument,
  ): Promise<void> {
    const ownerUserId = currentGroup?.createdByUserId ?? user.id;
    const existingGroup = await this.groupModel
      .findOne({
        isArchived: { $ne: true },
        createdByUserId: ownerUserId,
        ...(currentGroup ? { groupId: { $ne: currentGroup.groupId } } : {}),
      })
      .collation({ locale: 'en', strength: 2 })
      .where('name')
      .equals(name)
      .exec();

    if (existingGroup) {
      throw new HttpException(
        createAppErrorBody(
          'group.name_already_exists',
          'A group with that name already exists',
        ),
        HttpStatus.CONFLICT,
      );
    }
  }

  private async assertStudentUsersExist(userIds: number[]): Promise<void> {
    if (userIds.length === 0) {
      return;
    }

    const students = await this.userRepository.find({
      where: { id: In(userIds), role: Role.STUDENT, isActive: true },
      select: {
        id: true,
      },
    });

    if (students.length !== userIds.length) {
      this.throwBadRequest(
        'common.bad_request',
        'At least one selected group member is not a valid active student',
      );
    }
  }

  private async loadStudentsById(
    userIds: number[],
  ): Promise<
    Map<number, Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'uo'>>
  > {
    const uniqueUserIds = Array.from(new Set(userIds));

    if (uniqueUserIds.length === 0) {
      return new Map();
    }

    const students = await this.userRepository.find({
      where: { id: In(uniqueUserIds) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        uo: true,
      },
    });

    return new Map(students.map((student) => [student.id, student]));
  }

  private throwBadRequest(
    code: 'common.bad_request' | 'group.import_requires_identifiers',
    message: string,
  ): never {
    throw new HttpException(
      createAppErrorBody(code, message),
      HttpStatus.BAD_REQUEST,
    );
  }

  private throwNotFound(): never {
    throw new HttpException(
      createAppErrorBody('common.not_found', 'Group not found'),
      HttpStatus.NOT_FOUND,
    );
  }
}
