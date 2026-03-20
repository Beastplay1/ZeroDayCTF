import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import {
  mongoFindOne,
  mongoFindMany,
  mongoUpdateOne,
  mongoInsertOne,
} from "@/lib/db/mongodb";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        // Check if user exists in database
        let existingUser = await mongoFindOne("users", {
          email: user.email,
        });

        // Generate username from email or name
        let username = existingUser?.username;
        if (!username) {
          if (user.name) {
            username = user.name.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
          } else if (user.email) {
            username = user.email
              .split("@")[0]
              .replace(/[^a-zA-Z0-9_]/g, "")
              .toLowerCase();
          } else {
            username = "user" + Math.floor(Math.random() * 100000);
          }
        }

        if (!existingUser) {
          // Get next numeric id
          const latestUsers = await mongoFindMany<{ id?: number }>(
            "users",
            {},
            { id: -1 },
            1,
          );
          const nextId = (latestUsers[0]?.id || 0) + 1;

          // Create new user if doesn't exist
          const newUser = {
            id: nextId,
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account?.provider,
            createdAt: new Date(),
            username,
          };
          await mongoInsertOne("users", newUser);
        } else {
          // Update user info if they already exist, and set username if missing
          await mongoUpdateOne(
            "users",
            { email: user.email },
            {
              $set: {
                name: user.name,
                image: user.image,
                lastLogin: new Date(),
                username,
              },
            },
          );
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (user) {
        token.email = user.email;
        token.sub = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.email = token.email as string;
      }
      (session as any).accessToken = token.accessToken;
      (session as any).provider = token.provider;
      return session;
    },

    async redirect({ url, baseUrl }) {
      // After OAuth, redirect to custom session route
      if (url === "/profile") {
        return `${baseUrl}/api/auth/oauth-session`;
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === new URL(baseUrl).origin) return url;
      return `${baseUrl}/api/auth/oauth-session`;
    },
  },
  secret: process.env.AUTH_SECRET,
};
