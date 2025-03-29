"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Esquema de validación
const userSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  roleId: z.string().min(1, { message: "Seleccione un rol" }),
  isActive: z.boolean().default(true),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }).optional(),
})

type UserFormValues = z.infer<typeof userSchema>

interface Role {
  _id: string
  name: string
  description: string
}

interface User {
  _id: string
  name: string
  email: string
  role: {
    _id: string
    name: string
  }
  isActive: boolean
}

export default function EditUserPage() {
  const { id } = useParams();
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const [user, setUser] = useState<User | null>(null)

  // Inicializar formulario
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      roleId: "",
      isActive: true,
      password: "",
    },
  })

  // Cargar datos del usuario y roles
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar roles
        const rolesResponse = await fetch("/api/roles")
        const rolesData = await rolesResponse.json()

        if (!rolesResponse.ok) {
          throw new Error(rolesData.error || "Error al cargar roles")
        }

        setRoles(rolesData.roles)

        // Cargar usuario
        const userResponse = await fetch(`/api/users/${id}`);
        const userData = await userResponse.json()

        if (!userResponse.ok) {
          throw new Error(userData.error || "Error al cargar usuario")
        }

        setUser(userData.user)

        // Establecer valores por defecto en el formulario
        form.reset({
          name: userData.user.name,
          roleId: userData.user.role._id,
          isActive: userData.user.isActive,
          password: "",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al cargar datos",
          variant: "destructive",
        })
        router.push("/dashboard/users")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [status, id, form, router])

  // Manejar envío del formulario
  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true)

    try {
      // Si la contraseña está vacía, la eliminamos del objeto para no actualizarla
      if (!data.password) {
        delete data.password
      }

      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el usuario")
      }

      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
      })

      router.push("/dashboard/users")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar si el usuario tiene permiso para gestionar usuarios
  const canManageUsers = session?.user.permissions.includes("manage_users")

  if (status === "loading" || isLoadingData) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!canManageUsers) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar usuario</h1>
          <p className="text-muted-foreground">Actualiza la información del usuario.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Acceso denegado</CardTitle>
            <CardDescription>No tienes permisos para gestionar usuarios.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar usuario</h1>
          <p className="text-muted-foreground">Actualiza la información del usuario.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Usuario no encontrado</CardTitle>
            <CardDescription>El usuario que intentas editar no existe.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/users">Volver a la lista de usuarios</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar usuario</h1>
          <p className="text-muted-foreground">Actualiza la información del usuario.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del usuario</CardTitle>
          <CardDescription>Actualiza la información del usuario {user.email}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormDescription>Nombre completo del usuario.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role._id} value={role._id}>
                            {role.name} - {role.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>El rol determina los permisos del usuario.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Usuario activo</FormLabel>
                      <FormDescription>Si está marcado, el usuario podrá iniciar sesión en el sistema.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña (opcional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nueva contraseña" {...field} />
                    </FormControl>
                    <FormDescription>
                      Deja en blanco para mantener la contraseña actual. Mínimo 8 caracteres.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/users">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

