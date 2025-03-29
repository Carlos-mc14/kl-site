import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/user"
import Role from "@/lib/models/role"
import { z } from "zod"

// Esquema de validación para actualizar usuario
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  roleId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_users")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    const user = await User.findById(id).select("-password").populate("role", "name")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_users")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    // Validar datos
    const validationResult = updateUserSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Verificar si el usuario existe
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verificar si el rol existe (si se está actualizando)
    if (body.roleId) {
      const role = await Role.findById(body.roleId)
      if (!role) {
        return NextResponse.json({ error: "Role not found" }, { status: 400 })
      }
      user.role = body.roleId
    }

    // Actualizar campos
    if (body.name) user.name = body.name
    if (body.isActive !== undefined) user.isActive = body.isActive
    if (body.password) user.password = body.password

    await user.save()

    // Retornar usuario actualizado sin contraseña
    const updatedUser = await User.findById(id).select("-password").populate("role", "name")

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_users")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    // Verificar si el usuario existe
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // No permitir eliminar al propio usuario
    if (user._id.toString() === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    await User.findByIdAndDelete(id)

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

