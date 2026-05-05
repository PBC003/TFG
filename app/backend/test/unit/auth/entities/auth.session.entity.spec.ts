import { getMetadataArgsStorage } from 'typeorm';
import { AuthSession } from '../../../../src/auth/entities/auth-session.entity';
import { User } from '../../../../src/users/entities/user.entity';
import { loadModuleWithoutReflect } from '../../helpers/load-without-reflect';

describe('AuthSession entity', () => {
  it('defines relation metadata and can be instantiated', () => {
    const session = new AuthSession();
    const user = new User();
    user.authSessions = [session];
    session.user = user;

    expect(session).toBeInstanceOf(AuthSession);
    expect(session.user).toBe(user);

    const relation = getMetadataArgsStorage().relations.find(
      (item) => item.target === AuthSession && item.propertyName === 'user',
    );

    expect(relation).toBeDefined();
    expect((relation?.type as () => unknown)()).toBe(User);
    expect(
      (relation?.inverseSideProperty as (value: User) => unknown)(user),
    ).toBe(user.authSessions);
  });

  it('loads the module without Reflect decorator helpers', () => {
    const { AuthSession: ReloadedAuthSession } = loadModuleWithoutReflect<
      typeof import('../../../../src/auth/entities/auth-session.entity')
    >('../../../../src/auth/entities/auth-session.entity', __filename);

    expect(new ReloadedAuthSession()).toBeInstanceOf(ReloadedAuthSession);
  });
});
