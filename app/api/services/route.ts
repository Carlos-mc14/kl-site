import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Service from "@/lib/models/service"
import { z } from "zod"

// Esquema de validación para crear servicio
const serviceSchema = z.object({
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  longDescription: z.string().min(20, { message: "La descripción larga debe tener al menos 20 caracteres" }),
  icon: z.string().min(1, { message: "El icono es requerido" }),
  features: z.array(z.string()).min(1, { message: "Debe incluir al menos una característica" }),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  slug: z.string().min(2, { message: "El slug debe tener al menos 2 caracteres" }),
})

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get("active") === "true"

    // Filtrar por servicios activos si se solicita
    const query = activeOnly ? { isActive: true } : {}

    const services = await Service.find(query).sort({ displayOrder: 1, createdAt: -1 })

    return NextResponse.json({ services })
  } catch (error: any) {
    console.error("Error fetching services:", error)
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
    const validationResult = serviceSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Verificar si ya existe un servicio con el mismo slug
    const existingService = await Service.findOne({ slug: body.slug })
    if (existingService) {
      return NextResponse.json({ error: "Ya existe un servicio con este slug" }, { status: 400 })
    }

    // Crear servicio
    const newService = new Service({
      title: body.title,
      description: body.description,
      longDescription: body.longDescription,
      icon: body.icon,
      features: body.features,
      displayOrder: body.displayOrder || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      slug: body.slug,
    })

    await newService.save()

    return NextResponse.json({ service: newService }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

