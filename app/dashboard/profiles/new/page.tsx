"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Esquema de validación
const profileSchema = z.object({
  userId: z.string().min(1, { message: "Selecciona un usuario" }),
  position: z.string().min(2, { message: "La posición debe tener al menos 2 caracteres" }),
  bio: z.string().min(10, { message: "La biografía debe tener al menos 10 caracteres" }),
  image: z.string().optional(),
  links: z.object({
    linkedin: z.string().optional(),
    github: z.string().optional(),
    portfolio: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
  }),
  isPublic: z.boolean().default(true),
  displayOrder: z.number().default(0),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface User {
  _id: string
  name: string
  email: string
}

export default function NewProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  // Inicializar formulario
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      userId: "",
      position: "",
      bio: "",
      image: "/placeholder.svg",
      links: {
        linkedin: "",
        github: "",
        portfolio: "",
        twitter: "",
        instagram: "",
      },
      isPublic: true,
      displayOrder: 0,
    },
  })

  // Cargar usuarios sin perfil
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Obtener todos los usuarios
        const usersResponse = await fetch("/api/users")
        const usersData = await usersResponse.json()

        if (!usersResponse.ok) {
          throw new Error(usersData.error || "Error al cargar usuarios")
        }

        // Obtener todos los perfiles
        const profilesResponse = await fetch("/api/profiles")
        const profilesData = await profilesResponse.json()

        if (!profilesResponse.ok) {
          throw new Error(profilesData.error || "Error al cargar perfiles")
        }

        // Filtrar usuarios que no tienen perfil
        const usersWithoutProfile = usersData.users.filter(
          (user: User) => !profilesData.profiles.some((profile: any) => profile.userId._id === user._id),
        )

        setUsers(usersWithoutProfile)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al cargar datos",
          variant: "destructive",
        })
      } finally {
        setIsLoadingUsers(false)
      }
    }

    if (status === "authenticated") {
      fetchUsers()
    }
  }, [status])

  // Manejar envío del formulario
  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al crear el perfil")
      }

      toast({
        title: "Perfil creado",
        description: "El perfil ha sido creado exitosamente",
      })

      router.push("/dashboard/profiles")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el perfil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar si el usuario tiene permiso para gestionar perfiles
  const canManageProfiles = session?.user.permissions.includes("manage_profiles")

  if (status === "loading" || isLoadingUsers) {
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
          <h1 className="text-3xl font-bold tracking-tight">Nuevo perfil</h1>
          <p className="text-muted-foreground">Crea un nuevo perfil para un miembro del equipo.</p>
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
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard/profiles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo perfil</h1>
          <p className="text-muted-foreground">Crea un nuevo perfil para un miembro del equipo.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del perfil</CardTitle>
          <CardDescription>Completa la información del perfil que se mostrará en la página de equipo.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                No hay usuarios disponibles para crear un perfil. Todos los usuarios ya tienen un perfil asignado.
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/users/new">Crear nuevo usuario</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un usuario" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Selecciona el usuario al que pertenecerá este perfil.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posición</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Director General" {...field} />
                      </FormControl>
                      <FormDescription>Cargo o posición en la empresa.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografía</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Breve descripción profesional..." className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormDescription>Descripción breve de la experiencia y responsabilidades.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de imagen</FormLabel>
                      <FormControl>
                        <Input placeholder="/placeholder.svg" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL de la imagen de perfil. Deja en blanco para usar la imagen por defecto.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Enlaces sociales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="links.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="links.github"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub</FormLabel>
                          <FormControl>
                            <Input placeholder="https://github.com/username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="links.portfolio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portafolio</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="links.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input placeholder="https://twitter.com/username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="links.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Perfil público</FormLabel>
                        <FormDescription>
                          Si está marcado, el perfil se mostrará en la página pública de equipo.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orden de visualización</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Número que determina el orden de aparición en la página de equipo. Los números más bajos
                        aparecen primero.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/profiles">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar perfil"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

