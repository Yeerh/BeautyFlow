import { Router } from "express";
import bcrypt from "bcryptjs";
import { signAuthToken } from "../auth/jwt.js";
import prisma from "../prisma/client.js";

const router = Router();
const MIN_PASSWORD_LENGTH = 6;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name?.trim() || "Cliente BeautyFlow",
    email: user.email,
    provider: String(user.provider ?? "EMAIL").toLowerCase(),
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        message: "Informe nome, e-mail e senha para criar a conta.",
      });
      return;
    }

    const trimmedName = name.trim();
    const normalizedEmail = normalizeEmail(email);
    const trimmedPassword = password.trim();

    if (trimmedName.length < 2) {
      res.status(400).json({
        message: "Informe um nome valido.",
      });
      return;
    }

    if (!normalizedEmail.includes("@")) {
      res.status(400).json({
        message: "Informe um e-mail valido.",
      });
      return;
    }

    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({
        message: `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    let user;

    if (!existingUser) {
      user = await prisma.user.create({
        data: {
          name: trimmedName,
          email: normalizedEmail,
          password: hashedPassword,
          provider: "EMAIL",
        },
      });
    } else if (existingUser.provider === "EMAIL" && !existingUser.password) {
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: trimmedName,
          password: hashedPassword,
          provider: "EMAIL",
        },
      });
    } else {
      res.status(409).json({
        message: "Ja existe uma conta cadastrada com este e-mail.",
      });
      return;
    }

    const token = signAuthToken(user);

    res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error?.code === "P2002") {
      res.status(409).json({
        message: "Ja existe uma conta cadastrada com este e-mail.",
      });
      return;
    }

    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({
        message: "Informe e-mail e senha para continuar.",
      });
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const trimmedPassword = password.trim();

    if (!normalizedEmail || !trimmedPassword) {
      res.status(400).json({
        message: "Informe e-mail e senha para continuar.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user?.password || user.provider !== "EMAIL") {
      res.status(401).json({
        message: "E-mail ou senha invalidos.",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        message: "E-mail ou senha invalidos.",
      });
      return;
    }

    const token = signAuthToken(user);

    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.status(204).end();
});

export default router;
