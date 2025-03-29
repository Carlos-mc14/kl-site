import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Feature from "@/lib/models/feature"
import { z } from "zod"

// Esquema de validación para crear característica
const featureSchema = z.object({
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  icon: z.string().min(1, { message: "El icono es requerido" }),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get("active") === "true"

    // Filtrar por características activas si se solicita
    const query = activeOnly ? { isActive: true } : {}

    const features = await Feature.find(query).sort({ displayOrder: 1, createdAt: -1 })

    return NextResponse.json({ features })
  } catch (error: any) {
    console.error("Error fetching features:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_content")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    // Validar datos
    const validationResult = featureSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Crear característica
    const newFeature = new Feature({
      title: body.title,
      description: body.description,
      icon: body.icon,
      displayOrder: body.displayOrder || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
    })

    await newFeature.save()

    return NextResponse.json({ feature: newFeature }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating feature:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

