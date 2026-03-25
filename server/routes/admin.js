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

function parseInteger(value) {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsedValue) ? Math.round(parsedValue) : null;
}

function formatPrice(priceCents) {
  return `${(priceCents / 100).toFixed(2).replace(".", ",")}$`;
}

function sanitizeAdminUser(user) {
  return {
    id: user.id,
    name: user.name?.trim() || "Administrador",
    username: user.username?.trim() || null,
    email: user.email,
    phone: user.phone?.trim() || null,
    businessName: user.businessName?.trim() || null,
    businessPhotoUrl: user.businessPhotoUrl?.trim() || null,
    businessAddress: user.businessAddress?.trim() || null,
    isActive: Boolean(user.isActive ?? true),
    role: String(user.role ?? "ADMIN"),
    createdAt: user.createdAt,
  };
}

function sanitizeService(service) {
  return {
    id: service.id,
    adminId: service.adminId,
    name: service.name,
    description: service.description ?? "",
    priceCents: service.priceCents,
    priceLabel: formatPrice(service.priceCents),
    isActive: Boolean(service.isActive),
    createdAt: service.createdAt,
  };
}

async function resolveAdminTargetId(currentUser, queryAdminId) {
  if (userHasRole(currentUser, ["SUPER_ADMIN"])) {
    const parsedAdminId = parseInteger(queryAdminId);

    if (!parsedAdminId) {
      return null;
    }

    const targetAdmin = await prisma.user.findFirst({
      where: {
        id: parsedAdminId,
        role: "ADMIN",
      },
      select: {
        id: true,
      },
    });

    return targetAdmin?.id ?? null;
  }

  return currentUser.id;
}

router.use(async (req, res, next) => {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);

    if (!authenticatedUser) {
      res.status(401).json({
        message: "Sessão inválida. Entre novamente para continuar.",
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
        message: "Sessão inválida. Entre novamente para continuar.",
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
        businessPhotoUrl: true,
        businessAddress: true,
        isActive: true,
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

    const {
      name,
      username,
      email,
      phone,
      businessName,
      businessPhotoUrl,
      businessAddress,
      password,
    } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof businessName !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        message: "Informe nome, usuário, e-mail, telefone, negócio e senha.",
      });
      return;
    }

    const trimmedName = name.trim();
    const normalizedUserName = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);
    const trimmedPhone = phone.trim();
    const trimmedBusinessName = businessName.trim();
    const trimmedPhotoUrl =
      typeof businessPhotoUrl === "string" ? businessPhotoUrl.trim() : "";
    const trimmedBusinessAddress =
      typeof businessAddress === "string" ? businessAddress.trim() : "";
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
        message: "Já existe uma conta com este usuário ou e-mail.",
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
        businessPhotoUrl: trimmedPhotoUrl || null,
        businessAddress: trimmedBusinessAddress || null,
        password: hashedPassword,
        provider: "EMAIL",
        role: "ADMIN",
        isActive: true,
        createdById: req.currentUser.id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        businessName: true,
        businessPhotoUrl: true,
        businessAddress: true,
        isActive: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      user: sanitizeAdminUser(adminUser),
    });
  } catch (error) {
    if (error?.code === "P2002") {
      res.status(409).json({
        message: "Já existe uma conta com este usuário ou e-mail.",
      });
      return;
    }

    next(error);
  }
});

router.patch("/users", async (req, res, next) => {
  try {
    if (!userHasRole(req.currentUser, ["SUPER_ADMIN"])) {
      res.status(403).json({
        message: "Somente o super admin pode editar contas administradoras.",
      });
      return;
    }

    const {
      id,
      name,
      username,
      email,
      phone,
      businessName,
      businessPhotoUrl,
      businessAddress,
      password,
      isActive,
    } = req.body ?? {};

    const adminId = parseInteger(id);

    if (!adminId) {
      res.status(400).json({
        message: "Informe qual conta administradora deve ser editada.",
      });
      return;
    }

    const currentAdmin = await prisma.user.findFirst({
      where: {
        id: adminId,
        role: "ADMIN",
      },
    });

    if (!currentAdmin) {
      res.status(404).json({
        message: "Conta administradora não encontrada.",
      });
      return;
    }

    const updateData = {};

    if (typeof name === "string" && name.trim().length >= 2) {
      updateData.name = name.trim();
    }

    if (typeof username === "string" && username.trim().length >= 4) {
      updateData.username = normalizeUsername(username);
    }

    if (typeof email === "string" && email.trim()) {
      updateData.email = normalizeEmail(email);
    }

    if (typeof phone === "string" && phone.trim().length >= 8) {
      updateData.phone = phone.trim();
    }

    if (typeof businessName === "string" && businessName.trim().length >= 2) {
      updateData.businessName = businessName.trim();
    }

    if (typeof businessPhotoUrl === "string") {
      updateData.businessPhotoUrl = businessPhotoUrl.trim() || null;
    }

    if (typeof businessAddress === "string") {
      updateData.businessAddress = businessAddress.trim() || null;
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (typeof password === "string" && password.trim()) {
      if (password.trim().length < MIN_PASSWORD_LENGTH) {
        res.status(400).json({
          message: "A senha da conta administradora precisa ter ao menos 6 caracteres.",
        });
        return;
      }

      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedAdminUser = await prisma.user.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        businessName: true,
        businessPhotoUrl: true,
        businessAddress: true,
        isActive: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      user: sanitizeAdminUser(updatedAdminUser),
    });
  } catch (error) {
    if (error?.code === "P2002") {
      res.status(409).json({
        message: "Já existe uma conta com este usuário ou e-mail.",
      });
      return;
    }

    next(error);
  }
});

router.delete("/users", async (req, res, next) => {
  try {
    if (!userHasRole(req.currentUser, ["SUPER_ADMIN"])) {
      res.status(403).json({
        message: "Somente o super admin pode excluir contas administradoras.",
      });
      return;
    }

    const adminId = parseInteger(req.body?.id ?? req.query.id);

    if (!adminId) {
      res.status(400).json({
        message: "Informe qual conta administradora deve ser excluída.",
      });
      return;
    }

    const currentAdmin = await prisma.user.findFirst({
      where: {
        id: adminId,
        role: "ADMIN",
      },
    });

    if (!currentAdmin) {
      res.status(404).json({
        message: "Conta administradora não encontrada.",
      });
      return;
    }

    await prisma.user.delete({
      where: { id: adminId },
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get("/profile", async (req, res, next) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.currentUser.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        businessName: true,
        businessPhotoUrl: true,
        businessAddress: true,
        isActive: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      profile: currentUser ? sanitizeAdminUser(currentUser) : null,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/profile", async (req, res, next) => {
  try {
    if (!userHasRole(req.currentUser, ["ADMIN"])) {
      res.status(403).json({
        message: "Somente administradores podem editar o próprio estabelecimento.",
      });
      return;
    }

    const { name, phone, businessName, businessPhotoUrl, businessAddress } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof phone !== "string" ||
      typeof businessName !== "string" ||
      typeof businessPhotoUrl !== "string" ||
      typeof businessAddress !== "string"
    ) {
      res.status(400).json({
        message: "Informe os dados do estabelecimento corretamente.",
      });
      return;
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedBusinessName = businessName.trim();
    const trimmedPhotoUrl = businessPhotoUrl.trim();
    const trimmedBusinessAddress = businessAddress.trim();

    if (
      trimmedName.length < 2 ||
      trimmedPhone.length < 8 ||
      trimmedBusinessName.length < 2 ||
      trimmedBusinessAddress.length < 3
    ) {
      res.status(400).json({
        message: "Preencha nome, telefone, negócio e endereço corretamente.",
      });
      return;
    }

    const updatedProfile = await prisma.user.update({
      where: { id: req.currentUser.id },
      data: {
        name: trimmedName,
        phone: trimmedPhone,
        businessName: trimmedBusinessName,
        businessPhotoUrl: trimmedPhotoUrl || null,
        businessAddress: trimmedBusinessAddress,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        businessName: true,
        businessPhotoUrl: true,
        businessAddress: true,
        isActive: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      profile: sanitizeAdminUser(updatedProfile),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/services", async (req, res, next) => {
  try {
    const targetAdminId = await resolveAdminTargetId(req.currentUser, req.query.adminId);

    if (!targetAdminId) {
      res.status(400).json({
        message: "Administrador inválido para listar serviços.",
      });
      return;
    }

    const services = await prisma.service.findMany({
      where: {
        adminId: targetAdminId,
      },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        adminId: true,
        name: true,
        description: true,
        priceCents: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json({
      items: services.map(sanitizeService),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/services", async (req, res, next) => {
  try {
    if (!userHasRole(req.currentUser, ["ADMIN", "SUPER_ADMIN"])) {
      res.status(403).json({
        message: "Somente administradores e super admin podem cadastrar serviços.",
      });
      return;
    }

    const { adminId, name, description, priceCents } = req.body ?? {};
    const parsedPriceCents = parseInteger(priceCents);
    const targetAdminId = await resolveAdminTargetId(req.currentUser, adminId);

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      parsedPriceCents === null ||
      !targetAdminId
    ) {
      res.status(400).json({
        message: "Informe o estabelecimento, nome, descrição e preço do serviço.",
      });
      return;
    }

    if (name.trim().length < 2 || parsedPriceCents <= 0) {
      res.status(400).json({
        message: "Preencha o serviço com um nome e preço válidos.",
      });
      return;
    }

    const service = await prisma.service.create({
      data: {
        adminId: targetAdminId,
        name: name.trim(),
        description: description.trim() || null,
        priceCents: parsedPriceCents,
        isActive: true,
      },
      select: {
        id: true,
        adminId: true,
        name: true,
        description: true,
        priceCents: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      service: sanitizeService(service),
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/services", async (req, res, next) => {
  try {
    if (!userHasRole(req.currentUser, ["ADMIN", "SUPER_ADMIN"])) {
      res.status(403).json({
        message: "Somente administradores e super admin podem editar serviços.",
      });
      return;
    }

    const { adminId, id, name, description, priceCents, isActive } = req.body ?? {};
    const serviceId = parseInteger(id);
    const targetAdminId = await resolveAdminTargetId(req.currentUser, adminId);

    if (!serviceId || !targetAdminId) {
      res.status(400).json({
        message: "Informe o estabelecimento e qual serviço deve ser editado.",
      });
      return;
    }

    const currentService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        adminId: targetAdminId,
      },
    });

    if (!currentService) {
      res.status(404).json({
        message: "Serviço não encontrado para este administrador.",
      });
      return;
    }

    const updateData = {};
    const parsedPriceCents = parseInteger(priceCents);

    if (typeof name === "string" && name.trim().length >= 2) {
      updateData.name = name.trim();
    }

    if (typeof description === "string") {
      updateData.description = description.trim() || null;
    }

    if (parsedPriceCents !== null && parsedPriceCents > 0) {
      updateData.priceCents = parsedPriceCents;
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
      select: {
        id: true,
        adminId: true,
        name: true,
        description: true,
        priceCents: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json({
      service: sanitizeService(updatedService),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
