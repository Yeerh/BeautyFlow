import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET ?? "beautyflow-dev-jwt-secret";

export function signAuthToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
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
