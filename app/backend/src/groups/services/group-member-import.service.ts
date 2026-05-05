import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { createAppErrorBody } from '../../common/errors/app-http.exception';
import { normalizeInstitutionalEmail } from '../../common/utils/email.util';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/enums/role.enum';
import type {
  GroupImportResult,
  GroupStudentOption,
} from '../types/group.types';
import { extractGroupMemberIdentifiers } from '../utils/group-import.util';
import { toGroupStudentOption } from '../utils/group-item.util';

@Injectable()
export class GroupMemberImportService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async importGroupMembers(rawText: string): Promise<GroupImportResult> {
    const extracted = extractGroupMemberIdentifiers(rawText);

    if (extracted.identifiers.length === 0) {
      throw new HttpException(
        createAppErrorBody(
          'group.import_requires_identifiers',
          'A CSV or spreadsheet list with at least one institutional email or UO identifier is required',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    const matchedStudents = await this.loadImportedStudents(
      extracted.emails,
      extracted.uos,
    );
    const matchedEmailSet = new Set(
      matchedStudents.map((student) =>
        normalizeInstitutionalEmail(student.email),
      ),
    );
    const matchedUoSet = new Set(
      matchedStudents.map((student) => student.uo.trim().toUpperCase()),
    );

    const missingIdentifiers = extracted.identifiers.filter((identifier) => {
      if (identifier.includes('@')) {
        return !matchedEmailSet.has(normalizeInstitutionalEmail(identifier));
      }

      return !matchedUoSet.has(identifier.trim().toUpperCase());
    });

    return {
      matchedStudents,
      missingIdentifiers,
      importedCount: extracted.identifiers.length,
      matchedCount: matchedStudents.length,
    };
  }

  async loadImportedStudents(
    emails: string[],
    uos: string[],
  ): Promise<GroupStudentOption[]> {
    if (emails.length === 0 && uos.length === 0) {
      return [];
    }

    const normalizedEmails = emails.map((email) =>
      normalizeInstitutionalEmail(email),
    );
    const normalizedUos = uos.map((uo) => uo.trim().toUpperCase());
    const where: Array<Record<string, unknown>> = [];

    if (normalizedEmails.length > 0) {
      where.push({
        role: Role.STUDENT,
        isActive: true,
        email: In(normalizedEmails),
      });
    }

    if (normalizedUos.length > 0) {
      where.push({
        role: Role.STUDENT,
        isActive: true,
        uo: In(normalizedUos),
      });
    }

    const students = await this.userRepository.find({
      where,
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
}
