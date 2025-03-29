import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/user"
import Role from "@/lib/models/role"
import { z } from "zod"

// Esquema de validación para crear usuario
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  roleId: z.string().min(1),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_users")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    // Obtener parámetros de consulta
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Obtener usuarios con paginación
    const users = await User.find({})
      .select("-password")
      .populate("role", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments({})

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_users")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    // Validar datos
    const validationResult = userSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: body.email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Verificar si el rol existe
    const role = await Role.findById(body.roleId)
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 400 })
    }

    // Crear usuario
    const newUser = new User({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.roleId,
    })

    await newUser.save()

    // Retornar usuario sin contraseña
    const user = newUser.toObject()
    delete user.password

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

