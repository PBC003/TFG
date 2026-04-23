export type GroupMutationDraft = {
  name?: string | null;
  description?: string | null;
  memberUserIds?: number[];
};

export type GroupMutationSnapshot = {
  name?: string | null;
  description?: string | null;
  memberUserIds?: number[];
};

export type NormalizedGroupMutationPayload = {
  name: string;
  description: string | null;
  memberUserIds: number[];
};

export type GroupBadRequestThrower = (
  code: 'common.bad_request',
  message: string,
) => never;

export function normalizeGroupMutationPayload(
  payload: GroupMutationDraft,
  current: GroupMutationSnapshot | undefined,
  throwBadRequest: GroupBadRequestThrower,
): NormalizedGroupMutationPayload {
  const name = (payload.name ?? current?.name ?? '').trim();
  const description =
    payload.description !== undefined
      ? payload.description?.trim() || null
      : current?.description?.trim() || null;
  const memberUserIds = Array.from(
    new Set(
      (payload.memberUserIds ?? current?.memberUserIds ?? []).map(Number),
    ),
  ).filter((value) => Number.isInteger(value) && value > 0);

  if (!name) {
    throwBadRequest('common.bad_request', 'A group name is required');
  }

  if (name.length < 3 || name.length > 120) {
    throwBadRequest(
      'common.bad_request',
      'The group name must contain between 3 and 120 characters',
    );
  }

  return {
    name,
    description,
    memberUserIds,
  };
}
