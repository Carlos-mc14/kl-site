"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, Loader2 } from "lucide-react"
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

interface Package {
  _id: string
  name: string
  title: string
  description: string
  price: number
  currency: string
  interval: string
  isPopular: boolean
  isActive: boolean
  displayOrder: number
  createdAt: string
}

export default function PackagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch("/api/packages")
        const data = await response.json()

        if (response.ok) {
          setPackages(data.packages)
        } else {
          toast({
            title: "Error",
            description: data.error || "No se pudieron cargar los paquetes",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los paquetes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchPackages()
    }
  }, [status])

  const togglePackageStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/packages/${id}`, {
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
        setPackages(packages.map((pkg) => (pkg._id === id ? { ...pkg, isActive: !currentStatus } : pkg)))

        toast({
          title: "Éxito",
          description: `Paquete ${!currentStatus ? "activado" : "desactivado"} correctamente`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo actualizar el paquete",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el paquete",
        variant: "destructive",
      })
    }
  }

  const togglePopularStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPopular: !currentStatus,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPackages(packages.map((pkg) => (pkg._id === id ? { ...pkg, isPopular: !currentStatus } : pkg)))

        toast({
          title: "Éxito",
          description: `Paquete ${!currentStatus ? "marcado como popular" : "desmarcado como popular"} correctamente`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo actualizar el paquete",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el paquete",
        variant: "destructive",
      })
    }
  }

  const deletePackage = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este paquete?")) {
      return
    }

    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPackages(packages.filter((pkg) => pkg._id !== id))

        toast({
          title: "Éxito",
          description: "Paquete eliminado correctamente",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "No se pudo eliminar el paquete",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el paquete",
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
          <h1 className="text-3xl font-bold tracking-tight">Paquetes</h1>
          <p className="text-muted-foreground">Gestiona los paquetes que se muestran en la página principal.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Paquetes</h1>
          <p className="text-muted-foreground">Gestiona los paquetes que se muestran en la página principal.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/packages/new">
            <Plus className="mr-2 h-4 w-4" /> Nuevo paquete
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de paquetes</CardTitle>
          <CardDescription>
            Estos paquetes se mostrarán en la sección de paquetes de la página principal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              No hay paquetes creados. Crea el primer paquete haciendo clic en "Nuevo paquete".
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Popular</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg._id}>
                    <TableCell className="font-medium">{pkg.title}</TableCell>
                    <TableCell>
                      {pkg.price.toLocaleString()} {pkg.currency.toUpperCase()}/{pkg.interval}
                    </TableCell>
                    <TableCell>
                      {pkg.isPopular ? (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          <Star className="h-3 w-3 mr-1" /> Popular
                        </Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {pkg.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{pkg.displayOrder}</TableCell>
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
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/packages/${pkg._id}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePopularStatus(pkg._id, pkg.isPopular)}>
                            <Star className="mr-2 h-4 w-4" />
                            <span>{pkg.isPopular ? "Quitar popular" : "Marcar como popular"}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePackageStatus(pkg._id, pkg.isActive)}>
                            {pkg.isActive ? (
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
                          <DropdownMenuItem onClick={() => deletePackage(pkg._id)} className="text-red-600">
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

