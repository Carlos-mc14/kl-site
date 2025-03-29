import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Service from "@/lib/models/service"
import { z } from "zod"

// Esquema de validación para actualizar servicio
const updateServiceSchema = z.object({
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres" }).optional(),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }).optional(),
  longDescription: z.string().min(20, { message: "La descripción larga debe tener al menos 20 caracteres" }).optional(),
  icon: z.string().min(1, { message: "El icono es requerido" }).optional(),
  features: z.array(z.string()).min(1, { message: "Debe incluir al menos una característica" }).optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  slug: z.string().min(2, { message: "El slug debe tener al menos 2 caracteres" }).optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    await dbConnect()

    const service = await Service.findById(id)

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error: any) {
    console.error("Error fetching service:", error)
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
    const validationResult = updateServiceSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Verificar si el servicio existe
    const service = await Service.findById(id)
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Si se está actualizando el slug, verificar que no exista otro servicio con ese slug
    if (body.slug && body.slug !== service.slug) {
      const existingService = await Service.findOne({ slug: body.slug })
      if (existingService) {
        return NextResponse.json({ error: "Ya existe un servicio con este slug" }, { status: 400 })
      }
    }

    // Actualizar campos
    if (body.title) service.title = body.title
    if (body.description) service.description = body.description
    if (body.longDescription) service.longDescription = body.longDescription
    if (body.icon) service.icon = body.icon
    if (body.features) service.features = body.features
    if (body.displayOrder !== undefined) service.displayOrder = body.displayOrder
    if (body.isActive !== undefined) service.isActive = body.isActive
    if (body.slug) service.slug = body.slug

    await service.save()

    return NextResponse.json({ service })
  } catch (error: any) {
    console.error("Error updating service:", error)
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

    // Verificar si el servicio existe
    const service = await Service.findById(id)
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    await Service.findByIdAndDelete(id)

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

