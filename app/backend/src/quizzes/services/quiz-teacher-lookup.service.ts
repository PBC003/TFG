import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class QuizTeacherLookupService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async loadTeacherNamesById(
    teacherIds: number[],
  ): Promise<Map<number, string>> {
    const uniqueTeacherIds = Array.from(new Set(teacherIds));

    if (uniqueTeacherIds.length === 0) {
      return new Map();
    }

    const teachers = await this.userRepository.findBy({
      id: In(uniqueTeacherIds),
    });

    return new Map(
      teachers.map((teacher) => [
        teacher.id,
        `${teacher.firstName} ${teacher.lastName}`.trim(),
      ]),
    );
  }
}
