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
  console.log("[REGISTER] Request body:", req.body); // Log para depuração
  try {
    const { name, email, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      console.error("[REGISTER] Dados inválidos recebidos:", req.body); // Log de erro
      res.status(400).json({
        message: "Informe nome, e-mail e senha para criar a conta.",
      });
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const trimmedPassword = password.trim();

    console.log("[REGISTER] Normalized email:", normalizedEmail); // Log para depuração

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      console.error("[REGISTER] Usuário já existe:", existingUser); // Log de erro
      res.status(409).json({
        message: "Já existe uma conta cadastrada com este e-mail.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    console.log("[REGISTER] Senha criptografada gerada."); // Log para depuração

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        provider: "EMAIL",
      },
    });

    console.log("[REGISTER] Usuário criado com sucesso:", user); // Log de sucesso

    const token = signAuthToken(user);

    res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("[REGISTER] Erro ao criar usuário:", error); // Log de erro detalhado
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  console.log("[LOGIN] Request body:", req.body); // Log para depuração
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      console.error("[LOGIN] Dados inválidos recebidos:", req.body); // Log de erro
      res.status(400).json({
        message: "Informe e-mail e senha para continuar.",
      });
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const trimmedPassword = password.trim();

    console.log("[LOGIN] Normalized email:", normalizedEmail); // Log para depuração

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.password) {
      console.error("[LOGIN] Usuário não encontrado ou sem senha:", user); // Log de erro
      res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);

    if (!isPasswordValid) {
      console.error("[LOGIN] Senha inválida para o usuário:", user); // Log de erro
      res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
      return;
    }

    console.log("[LOGIN] Usuário autenticado com sucesso:", user); // Log de sucesso

    const token = signAuthToken(user);

    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("[LOGIN] Erro ao autenticar usuário:", error); // Log de erro detalhado
    next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.status(204).end();
});

export default router;
