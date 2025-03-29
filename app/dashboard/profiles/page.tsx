"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"

interface Profile {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  position: string
  bio: string
  image: string
  isPublic: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export default function ProfilesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch("/api/profiles")
        const data = await response.json()

        if (response.ok) {
          setProfiles(data.profiles)
        } else {
          toast({
            title: "Error",
            description: data.error || "No se pudieron cargar los perfiles",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los perfiles",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchProfiles()
    }
  }, [status])

  const togglePublicStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/profiles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublic: !currentStatus,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setProfiles(
          profiles.map((profile) => (profile._id === id ? { ...profile, isPublic: !currentStatus } : profile)),
        )

        toast({
          title: "Éxito",
          description: `Perfil ${!currentStatus ? "publicado" : "ocultado"} correctamente`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo actualizar el perfil",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el perfil",
        variant: "destructive",
      })
    }
  }

  const changeDisplayOrder = async (id: string, direction: "up" | "down") => {
    const currentIndex = profiles.findIndex((profile) => profile._id === id)
    if ((direction === "up" && currentIndex === 0) || (direction === "down" && currentIndex === profiles.length - 1)) {
      return
    }

    const newOrder =
      direction === "up" ? profiles[currentIndex - 1].displayOrder - 1 : profiles[currentIndex + 1].displayOrder + 1

    try {
      const response = await fetch(`/api/profiles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayOrder: newOrder,
        }),
      })

      if (response.ok) {
        // Recargar perfiles para obtener el nuevo orden
        const profilesResponse = await fetch("/api/profiles")
        const data = await profilesResponse.json()

        if (profilesResponse.ok) {
          setProfiles(data.profiles)

          toast({
            title: "Éxito",
            description: "Orden actualizado correctamente",
          })
        }
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "No se pudo actualizar el orden",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el orden",
        variant: "destructive",
      })
    }
  }

  const deleteProfile = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este perfil?")) {
      return
    }

    try {
      const response = await fetch(`/api/profiles/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProfiles(profiles.filter((profile) => profile._id !== id))

        toast({
          title: "Éxito",
          description: "Perfil eliminado correctamente",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "No se pudo eliminar el perfil",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el perfil",
        variant: "destructive",
      })
    }
  }

  // Verificar si el usuario tiene permiso para gestionar perfiles
  const canManageProfiles = session?.user.permissions.includes("manage_profiles")

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!canManageProfiles) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfiles</h1>
          <p className="text-muted-foreground">Gestiona los perfiles de los miembros del equipo.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Acceso denegado</CardTitle>
            <CardDescription>No tienes permisos para gestionar perfiles.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfiles</h1>
          <p className="text-muted-foreground">Gestiona los perfiles de los miembros del equipo.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/profiles/new">
            <Plus className="mr-2 h-4 w-4" /> Nuevo perfil
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfiles del equipo</CardTitle>
          <CardDescription>Estos perfiles se mostrarán en la página pública de equipo.</CardDescription>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              No hay perfiles creados. Crea el primer perfil haciendo clic en "Nuevo perfil".
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miembro</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={profile.image} alt={profile.userId.name} />
                          <AvatarFallback>
                            {profile.userId.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.userId.name}</p>
                          <p className="text-xs text-muted-foreground">{profile.userId.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{profile.position}</TableCell>
                    <TableCell>
                      {profile.isPublic ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Público
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Oculto
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => changeDisplayOrder(profile._id, "up")}
                          disabled={profiles.indexOf(profile) === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => changeDisplayOrder(profile._id, "down")}
                          disabled={profiles.indexOf(profile) === profiles.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/profiles/${profile._id}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublicStatus(profile._id, profile.isPublic)}>
                            {profile.isPublic ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                <span>Ocultar</span>
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Publicar</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => deleteProfile(profile._id)} className="text-red-600">
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

