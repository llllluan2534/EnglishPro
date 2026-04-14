import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Cấu hình sau khi có Client ID/Secret
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      return true; // Để mặc định là true, việc redirect đã xử lý trong middleware
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
