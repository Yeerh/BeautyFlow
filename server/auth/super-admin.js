import bcrypt from "bcryptjs";
import prisma from "../prisma/client.js";

export const SUPER_ADMIN_USERNAME = "diegoadmin";
export const SUPER_ADMIN_PASSWORD = "superadmin@";
const SUPER_ADMIN_EMAIL = "diegoadmin@beautyflow.admin";
const SUPER_ADMIN_NAME = "Diego Super Admin";
const SUPER_ADMIN_BUSINESS = "BeautyFlow Master";

let superAdminBootstrapPromise = null;

export function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

export async function ensureSuperAdminUser() {
  if (superAdminBootstrapPromise) {
    return superAdminBootstrapPromise;
  }

  superAdminBootstrapPromise = (async () => {
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
    const normalizedUsername = normalizeUsername(SUPER_ADMIN_USERNAME);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: normalizedUsername }, { email: SUPER_ADMIN_EMAIL }],
      },
    });

    if (existingUser) {
      return prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: existingUser.name?.trim() || SUPER_ADMIN_NAME,
          username: normalizedUsername,
          email: SUPER_ADMIN_EMAIL,
          businessName: existingUser.businessName?.trim() || SUPER_ADMIN_BUSINESS,
          isActive: true,
          password: hashedPassword,
          provider: "EMAIL",
          role: "SUPER_ADMIN",
        },
      });
    }

    return prisma.user.create({
      data: {
        name: SUPER_ADMIN_NAME,
        username: normalizedUsername,
        email: SUPER_ADMIN_EMAIL,
        businessName: SUPER_ADMIN_BUSINESS,
        isActive: true,
        password: hashedPassword,
        provider: "EMAIL",
        role: "SUPER_ADMIN",
      },
    });
  })().catch((error) => {
    superAdminBootstrapPromise = null;
    throw error;
  });

  return superAdminBootstrapPromise;
}
