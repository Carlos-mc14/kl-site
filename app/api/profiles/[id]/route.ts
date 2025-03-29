import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Profile from "@/lib/models/profile"
import { z } from "zod"

// Esquema de validación para actualizar perfil
const updateProfileSchema = z.object({
  position: z.string().min(2).optional(),
  bio: z.string().min(10).optional(),
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

// Modificar la función GET para usar await en params
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Asegurarse de que params sea desenvuelto
    const id = params.id

    await dbConnect()

    const profile = await Profile.findById(id).populate("userId", "name email")

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Si el perfil no es público, verificar autenticación
    if (!profile.isPublic) {
      const session = await getServerSession(authOptions)
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Modificar la función PUT para usar await en params
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Asegurarse de que params sea desenvuelto
    const id = params.id

    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_profiles")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    // Validar datos
    const validationResult = updateProfileSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Verificar si el perfil existe
    const profile = await Profile.findById(id)
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Actualizar campos
    if (body.position) profile.position = body.position
    if (body.bio) profile.bio = body.bio
    if (body.image) profile.image = body.image
    if (body.links) profile.links = { ...profile.links, ...body.links }
    if (body.isPublic !== undefined) profile.isPublic = body.isPublic
    if (body.displayOrder !== undefined) profile.displayOrder = body.displayOrder

    await profile.save()

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Modificar la función DELETE para usar await en params
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Asegurarse de que params sea desenvuelto
    const id = params.id

    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_profiles")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    // Verificar si el perfil existe
    const profile = await Profile.findById(id)
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    await Profile.findByIdAndDelete(id)

    return NextResponse.json({ message: "Profile deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting profile:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

