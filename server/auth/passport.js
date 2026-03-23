import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "../prisma/client.js";
import { getBackendUrl } from "../config/public-urls.js";

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const backendUrl = getBackendUrl();

export const isGoogleAuthConfigured = Boolean(clientID && clientSecret);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    done(null, user ?? false);
  } catch (error) {
    done(error, false);
  }
});

if (isGoogleAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: `${backendUrl}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.trim().toLowerCase();

          if (!email) {
            return done(new Error("Google profile did not return an email."), null);
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                name: profile.displayName,
                email,
                password: null,
                provider: "GOOGLE",
                googleId: profile.id,
              },
            });
          } else if (!user.googleId || user.provider !== "GOOGLE" || user.name !== profile.displayName) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                name: profile.displayName || user.name,
                googleId: profile.id,
                provider: "GOOGLE",
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
}

export default passport;
