import { getMetadataArgsStorage } from 'typeorm';
import { AuthSession } from '../../../../src/auth/entities/auth-session.entity';
import { User } from '../../../../src/users/entities/user.entity';
import { loadModuleWithoutReflect } from '../../helpers/load-without-reflect';

describe('User entity', () => {
  it('defines relation metadata and can be instantiated', () => {
    const user = new User();
    const session = new AuthSession();
    session.user = user;
    user.authSessions = [session];

    expect(user).toBeInstanceOf(User);
    expect(user.authSessions).toEqual([session]);

    const relation = getMetadataArgsStorage().relations.find(
      (item) => item.target === User && item.propertyName === 'authSessions',
    );

    expect(relation).toBeDefined();
    expect((relation?.type as () => unknown)()).toBe(AuthSession);
    expect(
      (relation?.inverseSideProperty as (value: AuthSession) => unknown)(
        session,
      ),
    ).toBe(session.user);
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { User: ReloadedUser } = loadModuleWithoutReflect<
      typeof import('../../../../src/users/entities/user.entity')
    >('../../../../src/users/entities/user.entity');

    expect(new ReloadedUser()).toBeInstanceOf(ReloadedUser);
  });
});
