import { Router } from "express";
import prisma from "../prisma/client.js";
import { getAuthenticatedUser, userHasRole } from "../auth/session.js";
import {
  buildFutureScheduleFilter,
  buildScheduledAt,
  buildSyntheticClientEmail,
  formatPrice,
  normalizeEmail,
  parseInteger,
} from "../lib/schedule.js";
import { ensureAvailabilitySlotTable } from "../lib/ensure-schema.js";

const router = Router();

function buildSlotKey(scheduledDate, scheduledTime) {
  return `${scheduledDate} ${scheduledTime}`;
}

function mapDashboardBookingItem(booking) {
  return {
    id: booking.id,
    adminId: booking.adminId ?? null,
    clientName: booking.clientName,
    phone: booking.phone,
    serviceName: booking.serviceName,
    servicePrice: booking.servicePrice,
    servicePriceCents: booking.servicePriceCents,
    scheduledDate: booking.scheduledDate,
    scheduledTime: booking.scheduledTime,
    status: booking.status,
    createdAt: booking.createdAt,
    locationName:
      booking.admin?.businessName?.trim() || booking.admin?.name?.trim() || null,
  };
}

function mapClientBookingHistoryItem(booking) {
  return {
    id: booking.id,
    locationId: booking.adminId ?? null,
    locationName:
      booking.admin?.businessName?.trim() || booking.admin?.name?.trim() || "Local indisponivel",
    locationAddress: booking.admin?.businessAddress?.trim() || null,
    serviceName: booking.serviceName,
    servicePrice: booking.servicePrice,
    scheduledDate: booking.scheduledDate,
    scheduledTime: booking.scheduledTime,
    status: booking.status,
    createdAt: booking.createdAt,
  };
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
      items: bookings.map(mapDashboardBookingItem),
    });
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

router.get("/availability", async (req, res, next) => {
  try {
    const adminId = parseInteger(req.query.adminId);

    if (!adminId) {
      res.json({ items: [] });
      return;
    }

    await ensureAvailabilitySlotTable();

    const [slots, occupiedBookings] = await Promise.all([
      prisma.availabilitySlot.findMany({
        where: {
          adminId,
          ...buildFutureScheduleFilter(),
        },
        select: {
          id: true,
          scheduledDate: true,
          scheduledTime: true,
        },
        orderBy: [{ scheduledAt: "asc" }, { id: "asc" }],
      }),
      prisma.booking.findMany({
        where: {
          adminId,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
          ...buildFutureScheduleFilter(),
        },
        select: {
          scheduledDate: true,
          scheduledTime: true,
        },
      }),
    ]);

    const occupiedSlots = new Set(
      occupiedBookings.map((booking) => buildSlotKey(booking.scheduledDate, booking.scheduledTime)),
    );

    res.json({
      items: slots.filter(
        (slot) => !occupiedSlots.has(buildSlotKey(slot.scheduledDate, slot.scheduledTime)),
      ),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/mine", async (req, res, next) => {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);

    if (!authenticatedUser) {
      res.status(401).json({
        message: "Sessao invalida. Entre novamente para continuar.",
      });
      return;
    }

    if (!userHasRole(authenticatedUser, ["CLIENT"])) {
      res.status(403).json({
        message: "Este historico esta disponivel apenas para contas pessoais.",
      });
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: authenticatedUser.id,
      },
      select: {
        id: true,
        adminId: true,
        serviceName: true,
        servicePrice: true,
        scheduledDate: true,
        scheduledTime: true,
        status: true,
        createdAt: true,
        admin: {
          select: {
            businessName: true,
            name: true,
            businessAddress: true,
          },
        },
      },
      orderBy: [{ scheduledAt: "desc" }, { id: "desc" }],
      take: 100,
    });

    res.json({
      items: bookings.map(mapClientBookingHistoryItem),
    });
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
        message: "Dados do agendamento invalidos.",
      });
      return;
    }

    const parsedAdminId = parseInteger(adminId);
    const parsedServiceId = parseInteger(serviceId);
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const normalizedBookingEmail = typeof email === "string" ? normalizeEmail(email) : "";
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedScheduledDate = scheduledDate.trim();
    const trimmedScheduledTime = scheduledTime.trim();
    const trimmedNotes = typeof notes === "string" ? notes.trim() : "";

    if (!parsedAdminId || !parsedServiceId || !trimmedScheduledDate || !trimmedScheduledTime) {
      res.status(400).json({
        message: "Escolha local, servico, data e horario para continuar.",
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

    if (scheduledAt.getTime() < Date.now()) {
      res.status(400).json({
        message: "Nao e possivel registrar agendamentos em horarios passados.",
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
      },
    });

    if (!location) {
      res.status(404).json({
        message: "Local selecionado nao esta disponivel.",
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
        name: true,
        priceCents: true,
      },
    });

    if (!service) {
      res.status(404).json({
        message: "Servico selecionado nao esta disponivel neste local.",
      });
      return;
    }

    await ensureAvailabilitySlotTable();

    const authenticatedUser = await getAuthenticatedUser(req);
    const isAdminActor = userHasRole(authenticatedUser, ["ADMIN", "SUPER_ADMIN"]);
    const isClientActor = userHasRole(authenticatedUser, ["CLIENT"]);

    if (
      isAdminActor &&
      authenticatedUser?.role !== "SUPER_ADMIN" &&
      authenticatedUser?.id !== parsedAdminId
    ) {
      res.status(403).json({
        message: "Voce so pode registrar clientes na agenda do seu proprio local.",
      });
      return;
    }

    const slotWhere = {
      adminId_scheduledDate_scheduledTime: {
        adminId: parsedAdminId,
        scheduledDate: trimmedScheduledDate,
        scheduledTime: trimmedScheduledTime,
      },
    };

    const existingSlot = await prisma.availabilitySlot.findUnique({
      where: slotWhere,
      select: {
        id: true,
      },
    });

    if (!existingSlot) {
      if (!isAdminActor) {
        res.status(409).json({
          message: "Este horario nao esta disponivel na agenda do local.",
        });
        return;
      }

      await prisma.availabilitySlot.create({
        data: {
          adminId: parsedAdminId,
          scheduledDate: trimmedScheduledDate,
          scheduledTime: trimmedScheduledTime,
          scheduledAt,
        },
      });
    }

    const activeBooking = await prisma.booking.findFirst({
      where: {
        adminId: parsedAdminId,
        scheduledDate: trimmedScheduledDate,
        scheduledTime: trimmedScheduledTime,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        id: true,
      },
    });

    if (activeBooking) {
      res.status(409).json({
        message: "Este horario ja foi reservado. Escolha outro.",
      });
      return;
    }

    let clientUser = null;
    let bookingName = trimmedName;
    let bookingEmail = normalizedBookingEmail;
    let bookingPhone = trimmedPhone;

    if (isClientActor && authenticatedUser) {
      clientUser = authenticatedUser;
      bookingName = trimmedName || authenticatedUser.name?.trim() || "BeautyFlow";
      bookingEmail = authenticatedUser.email;
      bookingPhone = trimmedPhone || authenticatedUser.phone?.trim() || "";

      if (bookingPhone.length < 8) {
        res.status(400).json({
          message: "Cadastre um telefone valido para concluir a reserva.",
        });
        return;
      }

      const nextUserData = {};

      if (bookingName && authenticatedUser.name !== bookingName) {
        nextUserData.name = bookingName;
      }

      if (trimmedPhone && authenticatedUser.phone !== trimmedPhone) {
        nextUserData.phone = trimmedPhone;
      }

      if (Object.keys(nextUserData).length > 0) {
        clientUser = await prisma.user.update({
          where: { id: authenticatedUser.id },
          data: nextUserData,
        });
      }
    } else {
      const requiresEmail = !isAdminActor;

      if (
        bookingName.length < 2 ||
        bookingPhone.length < 8 ||
        (requiresEmail && !bookingEmail)
      ) {
        res.status(400).json({
          message: requiresEmail
            ? "Preencha nome, e-mail, telefone, servico, data e horario."
            : "Preencha nome, telefone, servico, data e horario do cliente.",
        });
        return;
      }

      if (bookingEmail) {
        clientUser = await prisma.user.findFirst({
          where: {
            email: bookingEmail,
          },
        });

        if (clientUser && clientUser.role !== "CLIENT") {
          res.status(409).json({
            message: "O e-mail informado pertence a uma conta administrativa.",
          });
          return;
        }
      }

      if (!clientUser) {
        clientUser = await prisma.user.findFirst({
          where: {
            role: "CLIENT",
            phone: bookingPhone,
          },
          orderBy: [{ createdAt: "asc" }],
        });
      }

      if (!clientUser) {
        bookingEmail = bookingEmail || buildSyntheticClientEmail(bookingPhone, parsedAdminId);

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
        const nextUserData = {
          name: bookingName,
          phone: bookingPhone,
        };

        if (bookingEmail && clientUser.email !== bookingEmail) {
          nextUserData.email = bookingEmail;
        }

        clientUser = await prisma.user.update({
          where: { id: clientUser.id },
          data: nextUserData,
        });
      }

      bookingEmail = bookingEmail || clientUser.email;
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
        adminId: true,
        phone: true,
        serviceName: true,
        servicePrice: true,
        servicePriceCents: true,
        scheduledDate: true,
        scheduledTime: true,
        createdAt: true,
        status: true,
        clientName: true,
        admin: {
          select: {
            businessName: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      booking: mapDashboardBookingItem(booking),
    });
  } catch (error) {
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      res.status(401).json({
        message: "Sessao invalida. Entre novamente para continuar.",
      });
      return;
    }

    if (error?.code === "P2002") {
      const targets = Array.isArray(error?.meta?.target)
        ? error.meta.target.map((item) => String(item))
        : [];

      if (targets.includes("email")) {
        res.status(409).json({
          message: "Ja existe uma conta com este e-mail.",
        });
        return;
      }

      res.status(409).json({
        message: "Este horario ja foi reservado. Escolha outro.",
      });
      return;
    }

    next(error);
  }
});

export default router;
