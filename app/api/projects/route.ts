import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Project from "@/lib/models/project"
import { z } from "zod"

// Esquema de validación para crear proyecto
const projectSchema = z.object({
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  images: z.array(z.string()).min(1, { message: "Se requiere al menos una imagen" }),
  category: z.string().min(1, { message: "La categoría es requerida" }),
  client: z.string().min(1, { message: "El cliente es requerido" }),
  completionDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La fecha de finalización debe ser una fecha válida",
  }),
  technologies: z.array(z.string()).min(1, { message: "Debe incluir al menos una tecnología" }),
  link: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get("active") === "true"

    // Filtrar por proyectos activos si se solicita
    const query = activeOnly ? { isActive: true } : {}

    const projects = await Project.find(query).sort({ displayOrder: 1, createdAt: -1 })

    return NextResponse.json({ projects })
  } catch (error: any) {
    console.error("Error fetching projects:", error)
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
    const validationResult = projectSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Crear proyecto
    const newProject = new Project({
      title: body.title,
      description: body.description,
      images: body.images,
      category: body.category,
      client: body.client,
      completionDate: new Date(body.completionDate),
      technologies: body.technologies,
      link: body.link,
      displayOrder: body.displayOrder || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
    })

    await newProject.save()

    return NextResponse.json({ project: newProject }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

