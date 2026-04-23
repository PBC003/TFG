const bcrypt = require('bcrypt');
const dataSourceModule = require('../dist/database/data-source');
const userEntityModule = require('../dist/users/entities/user.entity');
const roleEnumModule = require('../dist/users/enums/role.enum');
const emailUtilModule = require('../dist/common/utils/email.util');

const dataSource = dataSourceModule.default ?? dataSourceModule;
const User = userEntityModule.User;
const Role = roleEnumModule.Role;
const {
  extractUoFromEmail,
  isValidInstitutionalEmail,
  normalizeInstitutionalEmail,
} = emailUtilModule;

function isEnabled(value) {
  return (value ?? 'true').trim().toLowerCase() === 'true';
}

async function main() {
  if (!isEnabled(process.env.SEED_ADMIN)) {
    console.log('[backend] Admin seed disabled.');
    return;
  }

  const rawEmail = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const firstName = (process.env.SEED_ADMIN_FIRST_NAME ?? 'Pablo').trim();
  const lastName = (process.env.SEED_ADMIN_LAST_NAME ?? 'Admin').trim();

  if (!rawEmail || !password) {
    console.log(
      '[backend] Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD. Skipping admin seed.',
    );
    return;
  }

  const email = normalizeInstitutionalEmail(rawEmail);

  if (!isValidInstitutionalEmail(email)) {
    throw new Error(
      `[backend] Invalid SEED_ADMIN_EMAIL. Expected a UniOvi account such as uo123456@uniovi.es, received: ${rawEmail}`,
    );
  }

  const uo = extractUoFromEmail(email);

  await dataSource.initialize();
  const repository = dataSource.getRepository(User);

  const existingUser = await repository.findOne({
    where: [{ email }, { uo }],
  });

  if (existingUser) {
    let updated = false;

    if (existingUser.role !== Role.ADMIN) {
      existingUser.role = Role.ADMIN;
      updated = true;
    }

    if (!existingUser.isActive) {
      existingUser.isActive = true;
      updated = true;
    }

    if (updated) {
      await repository.save(existingUser);
      console.log(
        `[backend] Existing user ${email} promoted/re-enabled as ADMIN.`,
      );
    } else {
      console.log(
        `[backend] Admin seed skipped. User ${email} already exists.`,
      );
    }

    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const adminUser = repository.create({
    firstName,
    lastName,
    email,
    uo,
    passwordHash,
    role: Role.ADMIN,
    isActive: true,
    lastLoginAt: null,
  });

  await repository.save(adminUser);
  console.log(`[backend] Seeded admin user ${email}.`);
}

main()
  .then(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  })
  .catch(async (error) => {
    console.error('[backend] Admin seed step failed.');
    console.error(error);

    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    process.exit(1);
  });
