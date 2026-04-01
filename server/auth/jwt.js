import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET ?? "beautyflow-dev-jwt-secret";

export function signAuthToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isActive: Boolean(user.isActive ?? true),
      role: String(user.role ?? "CLIENT").toLowerCase(),
      provider: String(user.provider ?? "EMAIL").toLowerCase(),
    },
    jwtSecret,
    { expiresIn: "7d" },
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, jwtSecret);
}

export function readBearerToken(request) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}
