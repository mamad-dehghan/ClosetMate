import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { ensurePreferences } from "./seed";
import {
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "./auth-utils";
import { DUMMY_PASSWORD_HASH, verifyPassword } from "./password";

const devLoginEnabled =
  process.env.ALLOW_DEV_LOGIN === "1" || process.env.NODE_ENV !== "production";

const providers = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Google verifies the address before issuing the account, so a user
      // who signed up with an email and password can safely use Google later.
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

providers.push(
  Credentials({
    id: "password",
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      const email = normalizeEmail(credentials?.email);
      const password = String(credentials?.password ?? "");

      if (!isValidEmail(email) || !isValidPassword(password)) return null;

      const existing = await db.query.users.findFirst({
        where: eq(schema.users.email, email),
      });

      // Always run the hash comparison so the response time does not reveal
      // whether the email exists or has a password attached.
      const passwordMatches = await verifyPassword(
        password,
        existing?.passwordHash ?? DUMMY_PASSWORD_HASH,
      );

      if (!existing?.passwordHash || !passwordMatches) return null;

      return {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        image: existing.image,
      };
    },
  }),
);

if (devLoginEnabled) {
  providers.push(
    Credentials({
      id: "dev",
      name: "Dev login",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      authorize: async (credentials) => {
        const email = normalizeEmail(credentials?.email);
        if (!isValidEmail(email)) return null;

        const existing = await db.query.users.findFirst({
          where: eq(schema.users.email, email),
        });

        if (existing) {
          return {
            id: existing.id,
            email: existing.email,
            name: existing.name,
            image: existing.image,
          };
        }

        const [created] = await db
          .insert(schema.users)
          .values({
            email,
            name: email.split("@")[0] ?? "Friend",
            emailVerified: new Date(),
          })
          .returning();

        if (!created) return null;

        return {
          id: created.id,
          email: created.email,
          name: created.name,
          image: created.image,
        };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  session: { strategy: "jwt" },
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "closetmate-dev-secret-change-me"),
  trustHost: true,
  pages: { signIn: "/login", error: "/login" },
  providers,
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      try {
        if (user.email && !user.name?.trim()) {
          await db
            .update(schema.users)
            .set({ name: user.email.split("@")[0] ?? "Friend" })
            .where(eq(schema.users.id, user.id));
        }
        await ensurePreferences(user.id);
      } catch (error) {
        // Account setup is nice-to-have; never block a valid sign-in on it.
        console.error("[closetmate] could not finish new user setup", error);
      }
    },
    async signIn({ user }) {
      if (!user.id) return;
      try {
        await ensurePreferences(user.id);
      } catch (error) {
        console.error("[closetmate] could not ensure preferences", error);
      }
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
