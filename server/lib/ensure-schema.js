import prisma from "../prisma/client.js";

let availabilitySlotTablePromise = null;

async function createAvailabilitySlotTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AvailabilitySlot" (
      "id" SERIAL NOT NULL,
      "adminId" INTEGER NOT NULL,
      "scheduledDate" TEXT NOT NULL,
      "scheduledTime" TEXT NOT NULL,
      "scheduledAt" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "AvailabilitySlot_adminId_fkey"
        FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "AvailabilitySlot_adminId_scheduledDate_scheduledTime_key"
    ON "AvailabilitySlot" ("adminId", "scheduledDate", "scheduledTime")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "AvailabilitySlot_adminId_scheduledAt_idx"
    ON "AvailabilitySlot" ("adminId", "scheduledAt")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "AvailabilitySlot_scheduledAt_idx"
    ON "AvailabilitySlot" ("scheduledAt")
  `);
}

export async function ensureAvailabilitySlotTable() {
  if (!availabilitySlotTablePromise) {
    availabilitySlotTablePromise = createAvailabilitySlotTable();
  }

  try {
    await availabilitySlotTablePromise;
  } catch (error) {
    availabilitySlotTablePromise = null;
    throw error;
  }
}
