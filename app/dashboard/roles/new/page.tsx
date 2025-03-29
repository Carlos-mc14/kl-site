"use client"

import { useState } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Esquema de validación
const roleSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  description: z.string().min(5, { message: "La descripción debe tener al menos 5 caracteres" }),
  permissions: z.array(z.string()).min(1, { message: "Selecciona al menos un permiso" }),
  isDefault: z.boolean().default(false),
})

type RoleFormValues = z.infer<typeof roleSchema>

// Lista de permisos disponibles
const availablePermissions = [
  { id: "manage_profiles", label: "Gestionar perfiles" },
  { id: "manage_users", label: "Gestionar usuarios" },
  { id: "manage_roles", label: "Gestionar roles" },
  { id: "view_dashboard", label: "Ver dashboard" },
  { id: "edit_settings", label: "Editar configuración" },
]

export default function NewRolePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Inicializar formulario
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: ["view_dashboard"],
      isDefault: false,
    },
  })

  // Manejar envío del formulario
  const onSubmit = async (data: RoleFormValues) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al crear el rol")
      }

      toast({
        title: "Rol creado",
        description: "El rol ha sido creado exitosamente",
      })

      router.push("/dashboard/roles")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el rol",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar si el usuario tiene permiso para gestionar roles
  const canManageRoles = session?.user.permissions.includes("manage_roles")

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!canManageRoles) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo rol</h1>
          <p className="text-muted-foreground">Crea un nuevo rol para el sistema.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Acceso denegado</CardTitle>
            <CardDescription>No tienes permisos para gestionar roles.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard/roles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo rol</h1>
          <p className="text-muted-foreground">Crea un nuevo rol para el sistema.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del rol</CardTitle>
          <CardDescription>Completa la información para crear un nuevo rol.</CardDescription>
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
                      <Input placeholder="Nombre del rol" {...field} />
                    </FormControl>
                    <FormDescription>Nombre único para identificar el rol.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descripción del rol" {...field} />
                    </FormControl>
                    <FormDescription>Breve descripción de las funciones del rol.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Permisos</FormLabel>
                      <FormDescription>Selecciona los permisos que tendrá este rol.</FormDescription>
                    </div>
                    <div className="space-y-2">
                      {availablePermissions.map((permission) => (
                        <FormField
                          key={permission.id}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => {
                            return (
                              <FormItem key={permission.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, permission.id])
                                        : field.onChange(field.value?.filter((value) => value !== permission.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{permission.label}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Rol predeterminado</FormLabel>
                      <FormDescription>
                        Si está marcado, este rol se asignará por defecto a los nuevos usuarios.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/roles">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar rol"
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

