import { Router } from "express";
import prisma from "../prisma/client.js";
import { getAuthenticatedUser, userHasRole } from "../auth/session.js";

const router = Router();

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

function buildScheduledAt(scheduledDate, scheduledTime) {
  const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);
  return Number.isNaN(scheduledAt.getTime()) ? null : scheduledAt;
}

function formatPrice(priceCents) {
  return `${(priceCents / 100).toFixed(2).replace(".", ",")}$`;
}

router.get("/", async (req, res, next) => {
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

    const where =
      authenticatedUser.role === "SUPER_ADMIN" ? {} : { adminId: authenticatedUser.id };

    const bookings = await prisma.booking.findMany({
      where,
      select: {
        id: true,
        adminId: true,
        clientName: true,
        phone: true,
        serviceName: true,
        servicePrice: true,
        servicePriceCents: true,
        scheduledDate: true,
        scheduledTime: true,
        status: true,
        createdAt: true,
        admin: {
          select: {
            businessName: true,
            name: true,
          },
        },
      },
      orderBy: [{ scheduledAt: "asc" }, { id: "desc" }],
      take: 200,
    });

    res.json({
      items: bookings.map((booking) => ({
        ...booking,
        locationName:
          booking.admin?.businessName?.trim() || booking.admin?.name?.trim() || null,
      })),
    });
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

router.get("/occupied", async (req, res, next) => {
  try {
    const adminId = parseInteger(req.query.adminId);

    if (!adminId) {
      res.json({ items: [] });
      return;
    }

    const occupiedBookings = await prisma.booking.findMany({
      where: {
        adminId,
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
    const { name, email, phone, notes, adminId, serviceId, scheduledDate, scheduledTime } =
      req.body ?? {};

    if (
      (typeof name !== "string" && typeof name !== "undefined") ||
      (typeof email !== "string" && typeof email !== "undefined") ||
      (typeof phone !== "string" && typeof phone !== "undefined") ||
      (typeof notes !== "string" && typeof notes !== "undefined") ||
      typeof scheduledDate !== "string" ||
      typeof scheduledTime !== "string"
    ) {
      res.status(400).json({
        message: "Dados do agendamento inválidos.",
      });
      return;
    }

    const parsedAdminId = parseInteger(adminId);
    const parsedServiceId = parseInteger(serviceId);
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? normalizeEmail(email) : "";
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedScheduledDate = scheduledDate.trim();
    const trimmedScheduledTime = scheduledTime.trim();
    const trimmedNotes = typeof notes === "string" ? notes.trim() : "";

    if (!parsedAdminId || !parsedServiceId || !trimmedScheduledDate || !trimmedScheduledTime) {
      res.status(400).json({
        message: "Escolha local, serviço, data e horário para continuar.",
      });
      return;
    }

    const scheduledAt = buildScheduledAt(trimmedScheduledDate, trimmedScheduledTime);

    if (!scheduledAt) {
      res.status(400).json({
        message: "Data ou horário do agendamento inválido.",
      });
      return;
    }

    const location = await prisma.user.findFirst({
      where: {
        id: parsedAdminId,
        role: "ADMIN",
        isActive: true,
      },
      select: {
        id: true,
        businessName: true,
      },
    });

    if (!location) {
      res.status(404).json({
        message: "Local selecionado não está disponível.",
      });
      return;
    }

    const service = await prisma.service.findFirst({
      where: {
        id: parsedServiceId,
        adminId: parsedAdminId,
        isActive: true,
      },
      select: {
        id: true,
        adminId: true,
        name: true,
        priceCents: true,
      },
    });

    if (!service) {
      res.status(404).json({
        message: "Serviço selecionado não está disponível neste local.",
      });
      return;
    }

    const authenticatedUser = await getAuthenticatedUser(req);

    let clientUser = authenticatedUser;
    let bookingName = trimmedName;
    let bookingEmail = normalizedEmail;
    let bookingPhone = trimmedPhone;

    if (clientUser) {
      bookingName = trimmedName || clientUser.name?.trim() || "Cliente BeautyFlow";
      bookingEmail = clientUser.email;
      bookingPhone = trimmedPhone || clientUser.phone?.trim() || "";

      if (bookingPhone.length < 8) {
        res.status(400).json({
          message: "Cadastre um telefone válido para concluir a reserva.",
        });
        return;
      }

      const nextUserData = {};

      if (bookingName && clientUser.name !== bookingName) {
        nextUserData.name = bookingName;
      }

      if (trimmedPhone && clientUser.phone !== trimmedPhone) {
        nextUserData.phone = trimmedPhone;
      }

      if (Object.keys(nextUserData).length > 0) {
        clientUser = await prisma.user.update({
          where: { id: clientUser.id },
          data: nextUserData,
        });
      }
    } else {
      bookingPhone = trimmedPhone;

      if (bookingName.length < 2 || !bookingEmail || bookingPhone.length < 8) {
        res.status(400).json({
          message: "Preencha nome, e-mail, telefone, serviço, data e horário.",
        });
        return;
      }

      clientUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!clientUser) {
        clientUser = await prisma.user.create({
          data: {
            name: bookingName,
            email: bookingEmail,
            phone: bookingPhone,
            password: null,
            provider: "EMAIL",
            role: "CLIENT",
            isActive: true,
          },
        });
      } else {
        clientUser = await prisma.user.update({
          where: { id: clientUser.id },
          data: {
            name: bookingName,
            phone: bookingPhone,
          },
        });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        userId: clientUser.id,
        adminId: parsedAdminId,
        serviceId: parsedServiceId,
        clientName: bookingName,
        clientEmail: bookingEmail,
        phone: bookingPhone,
        serviceName: service.name,
        servicePrice: formatPrice(service.priceCents),
        servicePriceCents: service.priceCents,
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
        servicePriceCents: true,
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
        message: "Sessão inválida. Entre novamente para continuar.",
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
