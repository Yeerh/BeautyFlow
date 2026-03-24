import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import bookingsRouter from "./routes/bookings.js";
import locationsRouter from "./routes/locations.js";
import { ensureSuperAdminUser } from "./auth/super-admin.js";
import { getFrontendUrl } from "./config/public-urls.js";

const app = express();
const frontendUrl = getFrontendUrl();

void ensureSuperAdminUser().catch((error) => {
  console.error("Failed to ensure super admin user.", error);
});

app.use(
  cors({
    origin: frontendUrl,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/locations", locationsRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: "Internal server error.",
  });
});

export default app;
