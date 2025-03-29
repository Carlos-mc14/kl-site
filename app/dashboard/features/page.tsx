"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
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

interface Feature {
  _id: string
  title: string
  description: string
  icon: string
  isActive: boolean
  displayOrder: number
  createdAt: string
}

// Componente para renderizar el icono dinámicamente
const DynamicIcon = ({ name }: { name: string }) => {
  const icons: Record<string, React.ReactNode> = {
    CheckCircle: (
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
        className="h-4 w-4 text-primary"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  }

  return (
    icons[name] || (
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
        className="h-4 w-4 text-primary"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    )
  )
}

export default function FeaturesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [features, setFeatures] = useState<Feature[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch("/api/features")
        const data = await response.json()

        if (response.ok) {
          setFeatures(data.features)
        } else {
          toast({
            title: "Error",
            description: data.error || "No se pudieron cargar las características",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar las características",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchFeatures()
    }
  }, [status])

  const toggleFeatureStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/features/${id}`, {
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
        setFeatures(
          features.map((feature) => (feature._id === id ? { ...feature, isActive: !currentStatus } : feature)),
        )

        toast({
          title: "Éxito",
          description: `Característica ${!currentStatus ? "activada" : "desactivada"} correctamente`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo actualizar la característica",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la característica",
        variant: "destructive",
      })
    }
  }

  const deleteFeature = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta característica?")) {
      return
    }

    try {
      const response = await fetch(`/api/features/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFeatures(features.filter((feature) => feature._id !== id))

        toast({
          title: "Éxito",
          description: "Característica eliminada correctamente",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "No se pudo eliminar la característica",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar la característica",
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
          <h1 className="text-3xl font-bold tracking-tight">Características</h1>
          <p className="text-muted-foreground">
            Gestiona las características que se muestran en la sección "¿Por qué elegirnos?".
          </p>
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
          <h1 className="text-3xl font-bold tracking-tight">Características</h1>
          <p className="text-muted-foreground">
            Gestiona las características que se muestran en la sección "¿Por qué elegirnos?".
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/features/new">
            <Plus className="mr-2 h-4 w-4" /> Nueva característica
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de características</CardTitle>
          <CardDescription>
            Estas características se mostrarán en la sección "¿Por qué elegirnos?" de la página principal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {features.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              No hay características creadas. Crea la primera característica haciendo clic en "Nueva característica".
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icono</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((feature) => (
                  <TableRow key={feature._id}>
                    <TableCell>
                      <DynamicIcon name={feature.icon} />
                    </TableCell>
                    <TableCell className="font-medium">{feature.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{feature.description}</TableCell>
                    <TableCell>
                      {feature.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{feature.displayOrder}</TableCell>
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
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/features/${feature._id}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFeatureStatus(feature._id, feature.isActive)}>
                            {feature.isActive ? (
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
                          <DropdownMenuItem onClick={() => deleteFeature(feature._id)} className="text-red-600">
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

