import { Router } from "express";
import bcrypt from "bcryptjs";
import { signAuthToken } from "../auth/jwt.js";
import { ensureSuperAdminUser, normalizeUsername } from "../auth/super-admin.js";
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
    username: user.username?.trim() || null,
    email: user.email,
    phone: user.phone?.trim() || null,
    businessName: user.businessName?.trim() || null,
    role: String(user.role ?? "CLIENT").toLowerCase(),
    provider: String(user.provider ?? "EMAIL").toLowerCase(),
  };
}

function buildLoginLookup(identifier) {
  const trimmedIdentifier = identifier.trim();
  const normalizedEmail = normalizeEmail(trimmedIdentifier);
  const normalizedUserName = normalizeUsername(trimmedIdentifier);

  return {
    OR: [{ email: normalizedEmail }, { username: normalizedUserName }],
  };
}

router.post("/register", async (req, res, next) => {
  try {
    await ensureSuperAdminUser();

    const { name, email, phone, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        message: "Informe nome, e-mail, telefone e senha para criar a conta.",
      });
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (
      trimmedName.length < 2 ||
      !normalizedEmail ||
      trimmedPhone.length < 8 ||
      trimmedPassword.length < MIN_PASSWORD_LENGTH
    ) {
      res.status(400).json({
        message: "Preencha nome, e-mail, telefone e uma senha valida.",
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).json({
        message: "Ja existe uma conta cadastrada com este e-mail.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        phone: trimmedPhone,
        password: hashedPassword,
        provider: "EMAIL",
        role: "CLIENT",
      },
    });

    const token = signAuthToken(user);

    res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    await ensureSuperAdminUser();

    const { email, identifier, password } = req.body ?? {};
    const loginIdentifier = typeof identifier === "string" ? identifier : email;

    if (typeof loginIdentifier !== "string" || typeof password !== "string") {
      res.status(400).json({
        message: "Informe usuario ou e-mail e senha para continuar.",
      });
      return;
    }

    const trimmedPassword = password.trim();

    if (!loginIdentifier.trim() || !trimmedPassword) {
      res.status(400).json({
        message: "Informe usuario ou e-mail e senha para continuar.",
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: buildLoginLookup(loginIdentifier),
    });

    if (!user || !user.password) {
      res.status(401).json({
        message: "Usuario, e-mail ou senha invalidos.",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        message: "Usuario, e-mail ou senha invalidos.",
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
