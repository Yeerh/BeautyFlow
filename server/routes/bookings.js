import { Router } from "express";
import prisma from "../prisma/client.js";
import { readBearerToken, verifyAuthToken } from "../auth/jwt.js";

const router = Router();

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function buildScheduledAt(scheduledDate, scheduledTime) {
  const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);
  return Number.isNaN(scheduledAt.getTime()) ? null : scheduledAt;
}

async function resolveAuthenticatedUser(request) {
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

router.get("/occupied", async (_req, res, next) => {
  try {
    const occupiedBookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        scheduledDate: true,
        scheduledTime: true,
      },
      orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
    });

    res.json({ items: occupiedBookings });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      notes,
      serviceName,
      servicePrice,
      scheduledDate,
      scheduledTime,
    } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof serviceName !== "string" ||
      typeof servicePrice !== "string" ||
      typeof scheduledDate !== "string" ||
      typeof scheduledTime !== "string"
    ) {
      res.status(400).json({
        message: "Dados do agendamento invalidos.",
      });
      return;
    }

    const trimmedName = name.trim();
    const normalizedEmail = normalizeEmail(email);
    const trimmedPhone = phone.trim();
    const trimmedServiceName = serviceName.trim();
    const trimmedServicePrice = servicePrice.trim();
    const trimmedScheduledDate = scheduledDate.trim();
    const trimmedScheduledTime = scheduledTime.trim();
    const trimmedNotes = typeof notes === "string" ? notes.trim() : "";

    if (
      trimmedName.length < 2 ||
      trimmedPhone.length < 8 ||
      !normalizedEmail ||
      !trimmedServiceName ||
      !trimmedServicePrice ||
      !trimmedScheduledDate ||
      !trimmedScheduledTime
    ) {
      res.status(400).json({
        message: "Preencha nome, e-mail, telefone, servico, data e horario.",
      });
      return;
    }

    const scheduledAt = buildScheduledAt(trimmedScheduledDate, trimmedScheduledTime);

    if (!scheduledAt) {
      res.status(400).json({
        message: "Data ou horario do agendamento invalido.",
      });
      return;
    }

    const authenticatedUser = await resolveAuthenticatedUser(req);

    let user = authenticatedUser;
    let bookingName = trimmedName;
    let bookingEmail = normalizedEmail;

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: trimmedName,
            email: normalizedEmail,
            password: null,
            provider: "EMAIL",
          },
        });
      } else if (user.name !== trimmedName) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: trimmedName,
          },
        });
      }
    } else {
      bookingEmail = user.email;
      bookingName = trimmedName || user.name || trimmedName;

      if (bookingName && user.name !== bookingName) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: bookingName,
          },
        });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        clientName: bookingName,
        clientEmail: bookingEmail,
        phone: trimmedPhone,
        serviceName: trimmedServiceName,
        servicePrice: trimmedServicePrice,
        scheduledDate: trimmedScheduledDate,
        scheduledTime: trimmedScheduledTime,
        scheduledAt,
        notes: trimmedNotes || null,
      },
      select: {
        id: true,
        serviceName: true,
        servicePrice: true,
        scheduledDate: true,
        scheduledTime: true,
        createdAt: true,
        status: true,
        clientName: true,
        clientEmail: true,
      },
    });

    res.status(201).json({ booking });
  } catch (error) {
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      res.status(401).json({
        message: "Sessao invalida. Entre novamente para continuar.",
      });
      return;
    }

    if (error?.code === "P2002") {
      res.status(409).json({
        message: "Este horario ja foi reservado. Escolha outro.",
      });
      return;
    }

    next(error);
  }
});

export default router;
