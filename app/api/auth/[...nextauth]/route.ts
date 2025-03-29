import NextAuth from "next-auth"
// Cambia esta línea:
// import { authOptions } from "@/lib/auth";
// Por esta:
import { authOptions } from "@/lib/auth-simplified"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

