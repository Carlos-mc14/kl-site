import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Package from "@/lib/models/package"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const packageItem = await Package.findById(params.id)

    if (!packageItem) {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ package: packageItem })
  } catch (error) {
    console.error("Error fetching package:", error)
    return NextResponse.json({ error: "Error al obtener el paquete" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!session.user.permissions.includes("manage_content")) {
      return NextResponse.json({ error: "No tienes permisos para actualizar paquetes" }, { status: 403 })
    }

    const data = await request.json()

    await dbConnect()

    const packageItem = await Package.findById(params.id)

    if (!packageItem) {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 })
    }

    // Actualizar el paquete con los nuevos datos
    Object.keys(data).forEach((key) => {
      packageItem[key] = data[key]
    })

    await packageItem.save()

    return NextResponse.json({ package: packageItem })
  } catch (error) {
    console.error("Error updating package:", error)
    return NextResponse.json({ error: "Error al actualizar el paquete" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!session.user.permissions.includes("manage_content")) {
      return NextResponse.json({ error: "No tienes permisos para eliminar paquetes" }, { status: 403 })
    }

    await dbConnect()

    const packageItem = await Package.findById(params.id)

    if (!packageItem) {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 })
    }

    await Package.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Paquete eliminado correctamente" })
  } catch (error) {
    console.error("Error deleting package:", error)
    return NextResponse.json({ error: "Error al eliminar el paquete" }, { status: 500 })
  }
}

