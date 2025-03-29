import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "./mongodb-client"
import dbConnect from "./mongodb"
import User from "./models/user"
import Role from "./models/role"
import { Redis } from "@upstash/redis"

// Configurar Redis para almacenar sesiones
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        await dbConnect()

        // Buscar usuario por email
        const user = await User.findOne({ email: credentials.email })

        if (!user || !user.isActive) {
          console.log("No user found or account is inactive")
          return null
        }

        // Verificar contraseña
        const isValid = await user.comparePassword(credentials.password)

        if (!isValid) {
          console.log("Invalid password")
          return null
        }

        // Obtener rol y permisos
        const role = await Role.findById(user.role)
        if (!role) {
          console.log("Role not found")
          return null
        }

        // Actualizar último login
        user.lastLogin = new Date()
        await user.save()

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: role.name,
          permissions: role.permissions,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.permissions = token.permissions as string[]
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}

