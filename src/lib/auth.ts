import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { ensurePreferences } from "./seed";

const devLoginEnabled =
  process.env.ALLOW_DEV_LOGIN === "1" || process.env.NODE_ENV !== "production";

const providers = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

if (devLoginEnabled) {
  providers.push(
    Credentials({
      id: "dev",
      name: "Dev login",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;

        const existing = await db.query.users.findFirst({
          where: eq(schema.users.email, email),
        });

        if (existing) {
          await ensurePreferences(existing.id);
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
        await ensurePreferences(created.id);

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
  pages: { signIn: "/login" },
  providers,
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
