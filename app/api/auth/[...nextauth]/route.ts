// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, User as NextAuthUser } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/data/prisma';
import bcrypt from 'bcrypt';
import { ROLES, type UserRole } from '@/types'; // Убедитесь, что UserRole и ROLES импортированы и определены

interface AuthorizeUser extends NextAuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<AuthorizeUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.error("[AUTH AUTHORIZE] Email или пароль не предоставлены");
          throw new Error('Пожалуйста, введите email и пароль');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.error("[AUTH AUTHORIZE] Пользователь не найден:", credentials.email);
          throw new Error('Неверные учетные данные');
        }
        if (!user.hashedPassword) {
            console.error("[AUTH AUTHORIZE] У пользователя нет хешированного пароля:", user.id);
            throw new Error('Проблема с аккаунтом пользователя, пароль не установлен.');
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValidPassword) {
          console.error("[AUTH AUTHORIZE] Неверный пароль для пользователя ID:", user.id);
          throw new Error('Неверные учетные данные');
        }

        // console.log("[AUTH AUTHORIZE] Авторизация успешна для пользователя ID:", user.id, "Image:", user.image);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image, 
          role: user.role as UserRole,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session: sessionFromTriggerUpdate }) {
      // console.log("[AUTH JWT] Trigger:", trigger, "User:", user ? (user as AuthorizeUser).id : 'N/A', "Token before:", JSON.stringify(token));
      
      if (user) { 
        const u = user as AuthorizeUser;
        token.id = u.id;
        token.name = u.name;
        token.email = u.email;
        token.role = u.role;
        token.picture = u.image; 
        // console.log("[AUTH JWT] User object present. Token updated. Picture:", token.picture);
      }

      if (trigger === "update" && sessionFromTriggerUpdate) {
        // console.log("[AUTH JWT] Trigger 'update'. Data from client:", sessionFromTriggerUpdate);
        if (typeof sessionFromTriggerUpdate.name === 'string' || sessionFromTriggerUpdate.name === null) {
          token.name = sessionFromTriggerUpdate.name;
        }
        if (sessionFromTriggerUpdate.image !== undefined) { 
          token.picture = sessionFromTriggerUpdate.image; 
        }
        // console.log("[AUTH JWT] Token updated by 'update' trigger. New picture:", token.picture);
      }
      // console.log("[AUTH JWT] Token after:", JSON.stringify(token));
      return token;
    },
    async session({ session, token }) {
      // console.log("[AUTH SESSION] Token for session:", JSON.stringify(token));
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null | undefined;
        session.user.email = token.email as string | null | undefined;
        session.user.role = token.role as UserRole;
        session.user.image = token.picture as string | null | undefined;
      }
      if (session.user && session.user.role === undefined) {
        console.error("[AUTH SESSION] Role undefined, setting default.");
        session.user.role = ROLES.USER; 
      }
      // console.log("[AUTH SESSION] Session after:", JSON.stringify(session));
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };