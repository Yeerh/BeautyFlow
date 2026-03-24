import prisma from "../prisma/client.js";
import { readBearerToken, verifyAuthToken } from "./jwt.js";

export async function getAuthenticatedUser(request) {
  const token = readBearerToken(request);

  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);

  if (!payload?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.id) },
  });

  return user ?? null;
}

export function userHasRole(user, allowedRoles) {
  if (!user) {
    return false;
  }

  return allowedRoles.includes(String(user.role ?? "CLIENT"));
}
