import { Router } from "express";
import prisma from "../prisma/client.js";
import { getAuthenticatedUser, userHasRole } from "../auth/session.js";

const router = Router();

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function buildScheduledAt(scheduledDate, scheduledTime) {
  const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);
  return Number.isNaN(scheduledAt.getTime()) ? null : scheduledAt;
}

router.get("/", async (req, res, next) => {
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

    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        clientName: true,
        phone: true,
        serviceName: true,
        servicePrice: true,
        scheduledDate: true,
        scheduledTime: true,
        status: true,
        createdAt: true,
      },
      orderBy: [{ scheduledAt: "asc" }, { id: "desc" }],
      take: 100,
    });

    res.json({ items: bookings });
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
      (typeof name !== "string" && typeof name !== "undefined") ||
      (typeof email !== "string" && typeof email !== "undefined") ||
      (typeof phone !== "string" && typeof phone !== "undefined") ||
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

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? normalizeEmail(email) : "";
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedServiceName = serviceName.trim();
    const trimmedServicePrice = servicePrice.trim();
    const trimmedScheduledDate = scheduledDate.trim();
    const trimmedScheduledTime = scheduledTime.trim();
    const trimmedNotes = typeof notes === "string" ? notes.trim() : "";

    if (
      !trimmedServiceName ||
      !trimmedServicePrice ||
      !trimmedScheduledDate ||
      !trimmedScheduledTime
    ) {
      res.status(400).json({
        message: "Preencha telefone, servico, data e horario.",
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

    const authenticatedUser = await getAuthenticatedUser(req);

    let user = authenticatedUser;
    let bookingName = trimmedName;
    let bookingEmail = normalizedEmail;
    let bookingPhone = trimmedPhone;

    if (user) {
      bookingName = trimmedName || user.name?.trim() || "Cliente BeautyFlow";
      bookingEmail = user.email;
      bookingPhone = trimmedPhone || user.phone?.trim() || "";

      if (bookingPhone.length < 8) {
        res.status(400).json({
          message: "Cadastre um telefone valido para concluir a reserva.",
        });
        return;
      }

      if (bookingName && user.name !== bookingName) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: bookingName,
          },
        });
      }

      if (trimmedPhone && user.phone !== trimmedPhone) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            phone: trimmedPhone,
          },
        });
      }
    } else {
      bookingPhone = trimmedPhone;

      if (bookingName.length < 2 || !bookingEmail || bookingPhone.length < 8) {
        res.status(400).json({
          message: "Preencha nome, e-mail, telefone, servico, data e horario.",
        });
        return;
      }

      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: trimmedName,
            email: normalizedEmail,
            phone: bookingPhone,
            password: null,
            provider: "EMAIL",
            role: "CLIENT",
          },
        });
      } else if (user.name !== trimmedName) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: trimmedName,
            phone: bookingPhone,
          },
        });
      } else if (user.phone !== bookingPhone) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            phone: bookingPhone,
          },
        });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        clientName: bookingName,
        clientEmail: bookingEmail,
        phone: bookingPhone,
        serviceName: trimmedServiceName,
        servicePrice: trimmedServicePrice,
        scheduledDate: trimmedScheduledDate,
        scheduledTime: trimmedScheduledTime,
        scheduledAt,
        notes: trimmedNotes || null,
      },
      select: {
        id: true,
        phone: true,
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
