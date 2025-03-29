import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Feature from "@/lib/models/feature"
import { z } from "zod"

// Esquema de validación para actualizar característica
const updateFeatureSchema = z.object({
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres" }).optional(),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }).optional(),
  icon: z.string().min(1, { message: "El icono es requerido" }).optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    await dbConnect()

    const feature = await Feature.findById(id)

    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 })
    }

    return NextResponse.json({ feature })
  } catch (error: any) {
    console.error("Error fetching feature:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_content")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    // Validar datos
    const validationResult = updateFeatureSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Verificar si la característica existe
    const feature = await Feature.findById(id)
    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 })
    }

    // Actualizar campos
    if (body.title) feature.title = body.title
    if (body.description) feature.description = body.description
    if (body.icon) feature.icon = body.icon
    if (body.displayOrder !== undefined) feature.displayOrder = body.displayOrder
    if (body.isActive !== undefined) feature.isActive = body.isActive

    await feature.save()

    return NextResponse.json({ feature })
  } catch (error: any) {
    console.error("Error updating feature:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const session = await getServerSession(authOptions)

    // Verificar autenticación y permisos
    if (!session || !session.user.permissions.includes("manage_content")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    // Verificar si la característica existe
    const feature = await Feature.findById(id)
    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 })
    }

    await Feature.findByIdAndDelete(id)

    return NextResponse.json({ message: "Feature deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting feature:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

