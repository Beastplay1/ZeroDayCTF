import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { mongoFindOne, mongoUpdateOne, mongoInsertOne } from "@/lib/db/mongodb";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
        const existingUser = await mongoFindOne("users", {
          email: user.email,
        });

        if (!existingUser) {
          // Create new user if doesn't exist
          const newUser = {
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account?.provider,
            createdAt: new Date(),
          };
          await mongoInsertOne("users", newUser);
        } else {
          // Update user info if they already exist
          await mongoUpdateOne(
            "users",
            { email: user.email },
            {
              $set: {
                name: user.name,
                image: user.image,
                lastLogin: new Date(),
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
      // Redirect to profile after signin with OAuth
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow redirect to same domain
      else if (new URL(url).origin === new URL(baseUrl).origin) return url;
      // Redirect to profile as default
      return `${baseUrl}/profile`;
    },
  },
  secret: process.env.AUTH_SECRET,
};
