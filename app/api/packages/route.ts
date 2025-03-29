import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Package from "@/lib/models/package"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const active = searchParams.get("active")

    await dbConnect()

    const query: any = {}
    if (active === "true") {
      query.isActive = true
    }

    const packages = await Package.find(query).sort({ displayOrder: 1 })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json({ error: "Error al obtener los paquetes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!session.user.permissions.includes("manage_content")) {
      return NextResponse.json({ error: "No tienes permisos para crear paquetes" }, { status: 403 })
    }

    const data = await request.json()

    await dbConnect()

    // Validar datos requeridos
    if (!data.name || !data.title || !data.description || !data.price) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: nombre, título, descripción y precio son obligatorios" },
        { status: 400 },
      )
    }

    // Obtener el último displayOrder para asignar uno nuevo
    const lastPackage = await Package.findOne().sort({ displayOrder: -1 })
    const displayOrder = lastPackage ? lastPackage.displayOrder + 1 : 0

    const newPackage = new Package({
      ...data,
      displayOrder,
    })

    await newPackage.save()

    return NextResponse.json({ package: newPackage }, { status: 201 })
  } catch (error) {
    console.error("Error creating package:", error)
    return NextResponse.json({ error: "Error al crear el paquete" }, { status: 500 })
  }
}

