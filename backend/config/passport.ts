import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`, // Must match Google Console exactly
        },
        async (accessToken, refreshToken, profile, done) => {
            // This function runs after Google confirms the login.
            // We simply pass the profile to the controller to handle the DB logic.
            return done(null, profile);
        }
    )
);

// These are required by Passport, even if we use session: false
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});