import { Router } from "express";
import passport, { isGoogleAuthConfigured } from "../auth/passport.js";
import { signAuthToken } from "../auth/jwt.js";

const router = Router();
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

function redirectWithError(res, errorCode) {
  res.redirect(`${frontendUrl}/cliente-acesso?error=${errorCode}`);
}

function ensureGoogleAuthConfigured(_req, res, next) {
  if (!isGoogleAuthConfigured) {
    redirectWithError(res, "google_not_configured");
    return;
  }

  next();
}

router.get("/google", ensureGoogleAuthConfigured, (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })(req, res, next);
});

router.get(
  "/google/callback",
  ensureGoogleAuthConfigured,
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${frontendUrl}/cliente-acesso?error=google_auth_failed`,
  }),
  (req, res) => {
    if (!req.user) {
      redirectWithError(res, "google_auth_failed");
      return;
    }

    const token = signAuthToken(req.user);

    const redirectUrl = new URL(`${frontendUrl}/auth-success`);
    redirectUrl.searchParams.set("token", token);

    res.redirect(redirectUrl.toString());
  },
);

router.get("/logout", (_req, res) => {
  res.redirect(`${frontendUrl}/cliente-acesso`);
});

export default router;
