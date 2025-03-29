import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Role from "@/lib/models/role"
import { z } from "zod"

// Esquema de validación para crear rol
const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  permissions: z.array(z.string()),
  isDefault: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_roles")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    const roles = await Role.find({}).sort({ name: 1 })

    return NextResponse.json({ roles })
  } catch (error: any) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_roles")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    // Validar datos
    const validationResult = roleSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Verificar si el nombre ya existe
    const existingRole = await Role.findOne({ name: body.name })
    if (existingRole) {
      return NextResponse.json({ error: "Role name already exists" }, { status: 400 })
    }

    // Crear rol
    const newRole = new Role({
      name: body.name,
      description: body.description,
      permissions: body.permissions,
      isDefault: body.isDefault || false,
    })

    await newRole.save()

    return NextResponse.json({ role: newRole }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating role:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

