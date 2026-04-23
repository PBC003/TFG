import { In, type Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity';

export function extractParticipantUserIds(
  participantNames: string[],
): number[] {
  return Array.from(
    new Set(
      participantNames
        .map((participantName) => {
          const match = /^(?:user|preview:user):(\d+)$/.exec(participantName);
          return match ? Number(match[1]) : null;
        })
        .filter((value): value is number => Number.isInteger(value)),
    ),
  );
}

export async function loadParticipantDisplayNames(
  userRepository: Repository<User>,
  participantNames: string[],
): Promise<Map<string, string>> {
  const uniqueParticipantNames = Array.from(new Set(participantNames));
  const participantMap = new Map<string, string>();
  const userIds = extractParticipantUserIds(uniqueParticipantNames);

  if (userIds.length > 0) {
    const users = await userRepository.findBy({ id: In(userIds) });

    for (const user of users) {
      const displayName = `${user.firstName} ${user.lastName}`.trim();
      participantMap.set(`user:${user.id}`, displayName);
      participantMap.set(`preview:user:${user.id}`, displayName);
    }
  }

  for (const participantName of uniqueParticipantNames) {
    if (!participantMap.has(participantName)) {
      participantMap.set(participantName, participantName);
    }
  }

  return participantMap;
}
