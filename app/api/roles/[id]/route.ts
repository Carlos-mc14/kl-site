import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Role from "@/lib/models/role"
import User from "@/lib/models/user"
import { z } from "zod"

// Esquema de validación para actualizar rol
const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  permissions: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Asegurarse de que params sea desenvuelto
    const id = params.id

    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_roles")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    const role = await Role.findById(id)

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    return NextResponse.json({ role })
  } catch (error: any) {
    console.error("Error fetching role:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Asegurarse de que params sea desenvuelto
    const id = params.id

    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_roles")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    // Validar datos
    const validationResult = updateRoleSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Verificar si el rol existe
    const role = await Role.findById(id)
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // Si se está actualizando el nombre, verificar que no exista otro rol con ese nombre
    if (body.name && body.name !== role.name) {
      const existingRole = await Role.findOne({ name: body.name })
      if (existingRole) {
        return NextResponse.json({ error: "Role name already exists" }, { status: 400 })
      }
      role.name = body.name
    }

    // Actualizar campos
    if (body.description) role.description = body.description
    if (body.permissions) role.permissions = body.permissions
    if (body.isDefault !== undefined) role.isDefault = body.isDefault

    await role.save()

    return NextResponse.json({ role })
  } catch (error: any) {
    console.error("Error updating role:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Asegurarse de que params sea desenvuelto
    const id = params.id

    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_roles")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    // Verificar si el rol existe
    const role = await Role.findById(id)
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    // Verificar si hay usuarios con este rol
    const usersWithRole = await User.countDocuments({ role: id })
    if (usersWithRole > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete role with associated users",
          count: usersWithRole,
        },
        { status: 400 },
      )
    }

    await Role.findByIdAndDelete(id)

    return NextResponse.json({ message: "Role deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting role:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

