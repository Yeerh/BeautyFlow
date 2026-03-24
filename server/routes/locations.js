import { Router } from "express";
import prisma from "../prisma/client.js";

const router = Router();

function formatPrice(priceCents) {
  return `${(priceCents / 100).toFixed(2).replace(".", ",")}$`;
}

function sanitizeLocation(location) {
  return {
    id: location.id,
    businessName: location.businessName?.trim() || "Estabelecimento",
    businessPhotoUrl: location.businessPhotoUrl?.trim() || null,
    businessAddress: location.businessAddress?.trim() || null,
    ownerName: location.name?.trim() || "Responsavel",
  };
}

router.get("/", async (req, res, next) => {
  try {
    const adminId = Number(req.query.adminId);

    if (Number.isFinite(adminId)) {
      const location = await prisma.user.findFirst({
        where: {
          id: adminId,
          role: "ADMIN",
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          businessName: true,
          businessPhotoUrl: true,
          businessAddress: true,
          services: {
            where: {
              isActive: true,
            },
            orderBy: [{ createdAt: "desc" }],
            select: {
              id: true,
              name: true,
              description: true,
              priceCents: true,
            },
          },
        },
      });

      if (!location) {
        res.status(404).json({
          message: "Local nao encontrado.",
        });
        return;
      }

      res.json({
        location: sanitizeLocation(location),
        services: location.services.map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description ?? "",
          priceCents: service.priceCents,
          priceLabel: formatPrice(service.priceCents),
        })),
      });
      return;
    }

    const locations = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        isActive: true,
      },
      orderBy: [{ businessName: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        businessName: true,
        businessPhotoUrl: true,
        businessAddress: true,
      },
    });

    res.json({
      items: locations.map(sanitizeLocation),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
