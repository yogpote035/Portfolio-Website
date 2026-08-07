import { ROLES } from '../constants/roles.js';
import { env } from '../config/env.js';
import { pool, testDatabaseConnection } from '../config/db.js';
import { createAdminUser, findUserByEmail } from '../models/userModel.js';
import { hashPassword } from '../utils/password.js';

async function seedAdmin() {
  await testDatabaseConnection();

  const existing = await findUserByEmail(env.adminSeed.email);
  if (existing) {
    console.log(`Admin already exists: ${env.adminSeed.email}`);
    await pool.end();
    return;
  }

  const passwordHash = await hashPassword(env.adminSeed.password);
  const admin = await createAdminUser({
    name: env.adminSeed.name,
    email: env.adminSeed.email,
    passwordHash,
    role: ROLES.SUPER_ADMIN,
  });

  console.log(`Super admin created: ${admin.email}`);
  await pool.end();
}

seedAdmin().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
