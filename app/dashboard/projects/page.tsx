"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface Project {
  _id: string
  title: string
  description: string
  images: string[]
  category: string
  client: string
  technologies: string[]
  isActive: boolean
  displayOrder: number
  createdAt: string
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        const data = await response.json()

        if (response.ok) {
          setProjects(data.projects)
        } else {
          toast({
            title: "Error",
            description: data.error || "No se pudieron cargar los proyectos",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los proyectos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchProjects()
    }
  }, [status])

  const toggleProjectStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setProjects(
          projects.map((project) => (project._id === id ? { ...project, isActive: !currentStatus } : project)),
        )

        toast({
          title: "Éxito",
          description: `Proyecto ${!currentStatus ? "activado" : "desactivado"} correctamente`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo actualizar el proyecto",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el proyecto",
        variant: "destructive",
      })
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este proyecto?")) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProjects(projects.filter((project) => project._id !== id))

        toast({
          title: "Éxito",
          description: "Proyecto eliminado correctamente",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "No se pudo eliminar el proyecto",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el proyecto",
        variant: "destructive",
      })
    }
  }

  // Verificar si el usuario tiene permiso para gestionar contenido
  const canManageContent = session?.user.permissions.includes("manage_content")

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!canManageContent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">Gestiona los proyectos que se muestran en la sección de portafolio.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Acceso denegado</CardTitle>
            <CardDescription>No tienes permisos para gestionar contenido.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">Gestiona los proyectos que se muestran en la sección de portafolio.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" /> Nuevo proyecto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de proyectos</CardTitle>
          <CardDescription>
            Estos proyectos se mostrarán en la sección de portafolio de la página principal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              No hay proyectos creados. Crea el primer proyecto haciendo clic en "Nuevo proyecto".
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>
                      <div className="relative w-16 h-16 rounded overflow-hidden">
                        <Image
                          src={project.images[0] || "/placeholder.svg"}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>{project.category}</TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>
                      {project.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{project.displayOrder}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <span className="sr-only">Abrir menú</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${project._id}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleProjectStatus(project._id, project.isActive)}>
                            {project.isActive ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                <span>Desactivar</span>
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Activar</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => deleteProject(project._id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

