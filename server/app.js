import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import bookingsRouter from "./routes/bookings.js";
import { getFrontendUrl } from "./config/public-urls.js";

const app = express();
const frontendUrl = getFrontendUrl();

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
app.use("/api/bookings", bookingsRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: "Internal server error.",
  });
});

export default app;
