import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import { prisma } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub!

        // Check subscription status from database
        if (session.user.email) {
          try {
            const user = await prisma.user.findUnique({
              where: { email: session.user.email },
              include: { subscription: true },
            })

            if (user?.subscription?.status === 'active') {
              (session.user as { subscriptionStatus?: string }).subscriptionStatus = 'active'
            } else {
              (session.user as { subscriptionStatus?: string }).subscriptionStatus = 'inactive'
            }
          } catch (error) {
            console.error('Error checking subscription:', error)
            ;(session.user as { subscriptionStatus?: string }).subscriptionStatus = 'inactive'
          }
        }
      }
      return session
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
})
