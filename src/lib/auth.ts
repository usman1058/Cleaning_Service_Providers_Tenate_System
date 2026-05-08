import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { verifyGuestAuthToken } from "@/lib/guest-auth-token"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        guestToken: { label: "Guest Token", type: "text" }
      },
      async authorize(credentials) {
        if (credentials?.guestToken) {
          const guestPayload = verifyGuestAuthToken(credentials.guestToken)
          if (!guestPayload) {
            throw new Error("Invalid guest token")
          }

          const user = await db.user.findUnique({ where: { id: guestPayload.userId } })
          if (!user || user.email !== guestPayload.email) {
            throw new Error("Guest account not found")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            guestBootstrap: true,
          }
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
        })
        if (!existingUser) {
          await db.user.create({
            data: {
              email: user.email!,
              password: '',
              name: user.name || '',
              role: 'CLIENT',
            },
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.permissions = (user as any).permissions
        token.guestBootstrap = (user as any).guestBootstrap || false
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        const dbUser = await db.user.findUnique({
          where: { email: session.user.email! },
        })
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
          session.user.permissions = dbUser.permissions
          session.user.guestBootstrap = Boolean(token.guestBootstrap)
        } else {
          session.user.id = token.id as string
          session.user.role = token.role as string
          session.user.permissions = token.permissions as string
          session.user.guestBootstrap = Boolean(token.guestBootstrap)
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
