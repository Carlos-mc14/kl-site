import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Project from "@/lib/models/project"
import { z } from "zod"

// Esquema de validación para actualizar proyecto
const updateProjectSchema = z.object({
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres" }).optional(),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }).optional(),
  images: z.array(z.string()).min(1, { message: "Se requiere al menos una imagen" }).optional(),
  category: z.string().min(1, { message: "La categoría es requerida" }).optional(),
  client: z.string().min(1, { message: "El cliente es requerido" }).optional(),
  completionDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de finalización debe ser una fecha válida",
    })
    .optional(),
  technologies: z.array(z.string()).min(1, { message: "Debe incluir al menos una tecnología" }).optional(),
  link: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    await dbConnect()

    const project = await Project.findById(id)

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error: any) {
    console.error("Error fetching project:", error)
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
    const validationResult = updateProjectSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Verificar si el proyecto existe
    const project = await Project.findById(id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Actualizar campos
    if (body.title) project.title = body.title
    if (body.description) project.description = body.description
    if (body.images) project.images = body.images
    if (body.category) project.category = body.category
    if (body.client) project.client = body.client
    if (body.completionDate) project.completionDate = new Date(body.completionDate)
    if (body.technologies) project.technologies = body.technologies
    if (body.link !== undefined) project.link = body.link
    if (body.displayOrder !== undefined) project.displayOrder = body.displayOrder
    if (body.isActive !== undefined) project.isActive = body.isActive

    await project.save()

    return NextResponse.json({ project })
  } catch (error: any) {
    console.error("Error updating project:", error)
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

    // Verificar si el proyecto existe
    const project = await Project.findById(id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    await Project.findByIdAndDelete(id)

    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

