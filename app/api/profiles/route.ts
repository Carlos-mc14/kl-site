import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Profile from "@/lib/models/profile"
import User from "@/lib/models/user"
import { z } from "zod"

// Esquema de validación para crear perfil
const profileSchema = z.object({
  userId: z.string().min(1),
  position: z.string().min(2),
  bio: z.string().min(10),
  image: z.string().optional(),
  links: z
    .object({
      linkedin: z.string().optional(),
      github: z.string().optional(),
      portfolio: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
  isPublic: z.boolean().optional(),
  displayOrder: z.number().optional(),
})

export async function GET(req: NextRequest) {
  try {
    // Para la página pública de equipo, no necesitamos autenticación
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const publicOnly = searchParams.get("public") === "true"

    // Filtrar por perfiles públicos si se solicita
    const query = publicOnly ? { isPublic: true } : {}

    const profiles = await Profile.find(query).populate("userId", "name email").sort({ displayOrder: 1, createdAt: -1 })

    return NextResponse.json({ profiles })
  } catch (error: any) {
    console.error("Error fetching profiles:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_profiles")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    // Validar datos
    const validationResult = profileSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Verificar si el usuario existe
    const user = await User.findById(body.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 })
    }

    // Verificar si ya existe un perfil para este usuario
    const existingProfile = await Profile.findOne({ userId: body.userId })
    if (existingProfile) {
      return NextResponse.json({ error: "Profile already exists for this user" }, { status: 400 })
    }

    // Crear perfil
    const newProfile = new Profile({
      userId: body.userId,
      position: body.position,
      bio: body.bio,
      image: body.image || "/placeholder.svg",
      links: body.links || {},
      isPublic: body.isPublic !== undefined ? body.isPublic : true,
      displayOrder: body.displayOrder || 0,
    })

    await newProfile.save()

    return NextResponse.json({ profile: newProfile }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating profile:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

