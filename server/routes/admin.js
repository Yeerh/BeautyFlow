import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma/client.js";
import { getAuthenticatedUser, userHasRole } from "../auth/session.js";
import { normalizeUsername } from "../auth/super-admin.js";

const router = Router();
const MIN_PASSWORD_LENGTH = 6;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function sanitizeAdminUser(user) {
  return {
    id: user.id,
    name: user.name?.trim() || "Administrador",
    username: user.username?.trim() || null,
    email: user.email,
    phone: user.phone?.trim() || null,
    businessName: user.businessName?.trim() || null,
    role: String(user.role ?? "ADMIN"),
    createdAt: user.createdAt,
  };
}

router.use(async (req, res, next) => {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);

    if (!authenticatedUser) {
      res.status(401).json({
        message: "Sessao invalida. Entre novamente para continuar.",
      });
      return;
    }

    if (!userHasRole(authenticatedUser, ["ADMIN", "SUPER_ADMIN"])) {
      res.status(403).json({
        message: "Acesso restrito ao painel administrativo.",
      });
      return;
    }

    req.currentUser = authenticatedUser;
    next();
  } catch (error) {
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      res.status(401).json({
        message: "Sessao invalida. Entre novamente para continuar.",
      });
      return;
    }

    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    if (!userHasRole(req.currentUser, ["SUPER_ADMIN"])) {
      res.status(403).json({
        message: "Somente o super admin pode visualizar as contas administradoras.",
      });
      return;
    }

    const adminUsers = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        businessName: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      items: adminUsers.map(sanitizeAdminUser),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/users", async (req, res, next) => {
  try {
    if (!userHasRole(req.currentUser, ["SUPER_ADMIN"])) {
      res.status(403).json({
        message: "Somente o super admin pode criar novas contas administradoras.",
      });
      return;
    }

    const { name, username, email, phone, businessName, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof businessName !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        message: "Informe nome, usuario, e-mail, telefone, negocio e senha.",
      });
      return;
    }

    const trimmedName = name.trim();
    const normalizedUserName = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);
    const trimmedPhone = phone.trim();
    const trimmedBusinessName = businessName.trim();
    const trimmedPassword = password.trim();

    if (
      trimmedName.length < 2 ||
      normalizedUserName.length < 4 ||
      !normalizedEmail ||
      trimmedPhone.length < 8 ||
      trimmedBusinessName.length < 2 ||
      trimmedPassword.length < MIN_PASSWORD_LENGTH
    ) {
      res.status(400).json({
        message: "Preencha os dados da conta administradora corretamente.",
      });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedUserName }],
      },
    });

    if (existingUser) {
      res.status(409).json({
        message: "Ja existe uma conta com este usuario ou e-mail.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    const adminUser = await prisma.user.create({
      data: {
        name: trimmedName,
        username: normalizedUserName,
        email: normalizedEmail,
        phone: trimmedPhone,
        businessName: trimmedBusinessName,
        password: hashedPassword,
        provider: "EMAIL",
        role: "ADMIN",
        createdById: req.currentUser.id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        businessName: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      user: sanitizeAdminUser(adminUser),
    });
  } catch (error) {
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      res.status(401).json({
        message: "Sessao invalida. Entre novamente para continuar.",
      });
      return;
    }

    if (error?.code === "P2002") {
      res.status(409).json({
        message: "Ja existe uma conta com este usuario ou e-mail.",
      });
      return;
    }

    next(error);
  }
});

export default router;
