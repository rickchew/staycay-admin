import { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

// Mock-only auth for Stage-1 frontend (DL-020). Replaces the original
// Metronic Prisma + bcrypt + Google flow because:
//   1) bcrypt is a native binary and cannot run on Cloudflare Workers,
//   2) Prisma needs Driver Adapters / Accelerate to run on Workers, and
//   3) the entire portal runs against `lib/mock`, not a real DB.
// When the NestJS API lands, this whole file gets swapped out for a real
// credentials provider that hits `/api/v1/auth/login`.

const DEMO_USERS = [
  {
    id: 'demo_super_admin',
    email: 'demo@kt.com',
    password: 'demo123',
    name: 'Rick Chew',
    roleName: 'SUPER_ADMIN',
    avatar: null as string | null,
    status: 'ACTIVE',
    roleId: 'role_super_admin',
  },
];

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember me', type: 'boolean' },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error(
            JSON.stringify({
              code: 400,
              message: 'Please enter both email and password.',
            }),
          );
        }

        const user = DEMO_USERS.find((u) => u.email === credentials.email);
        if (!user) {
          throw new Error(
            JSON.stringify({
              code: 404,
              message: 'User not found. Try demo@kt.com.',
            }),
          );
        }
        if (user.password !== credentials.password) {
          throw new Error(
            JSON.stringify({
              code: 401,
              message: 'Invalid credentials. Try password demo123.',
            }),
          );
        }

        return {
          id: user.id,
          status: user.status,
          email: user.email,
          name: user.name,
          roleId: user.roleId,
          avatar: user.avatar,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({
      token,
      user,
      session,
      trigger,
    }: {
      token: JWT;
      user: User;
      session?: Session;
      trigger?: 'signIn' | 'signUp' | 'update';
    }) {
      if (trigger === 'update' && session?.user) {
        token = session.user;
      } else if (user) {
        token.id = (user.id || token.sub) as string;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
        token.status = user.status;
        token.roleId = user.roleId;
        token.roleName = 'SUPER_ADMIN';
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.avatar = token.avatar;
        session.user.status = token.status;
        session.user.roleId = token.roleId;
        session.user.roleName = token.roleName;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    // Route auth errors back to the sign-in page (with ?error=...) instead
    // of NextAuth's generic /api/auth/error page, which leaks a stale URL
    // into the user's history if anything goes wrong mid-flow.
    error: '/signin',
  },
};

export default authOptions;
