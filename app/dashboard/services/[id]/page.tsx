"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Loader2, ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"

// Esquema de validación
const serviceSchema = z.object({
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  longDescription: z.string().min(20, { message: "La descripción larga debe tener al menos 20 caracteres" }),
  icon: z.string().min(1, { message: "El icono es requerido" }),
  features: z.array(z.string()).min(1, { message: "Debe incluir al menos una característica" }),
  displayOrder: z.number(),
  isActive: z.boolean().default(true),
  slug: z.string().min(2, { message: "El slug debe tener al menos 2 caracteres" }),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

interface Service {
  _id: string
  title: string
  description: string
  longDescription: string
  icon: string
  features: string[]
  displayOrder: number
  isActive: boolean
  slug: string
}

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [service, setService] = useState<Service | null>(null)
  const [newFeature, setNewFeature] = useState("")

  // Inicializar formulario
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      description: "",
      longDescription: "",
      icon: "",
      features: [],
      displayOrder: 0,
      isActive: true,
      slug: "",
    },
  })

  // Cargar datos del servicio
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al cargar servicio")
        }

        setService(data.service)

        // Establecer valores por defecto en el formulario
        form.reset({
          title: data.service.title,
          description: data.service.description,
          longDescription: data.service.longDescription,
          icon: data.service.icon,
          features: data.service.features,
          displayOrder: data.service.displayOrder,
          isActive: data.service.isActive,
          slug: data.service.slug,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al cargar datos",
          variant: "destructive",
        })
        router.push("/dashboard/services")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (status === "authenticated") {
      fetchService()
    }
  }, [status, id, form, router])

  // Manejar envío del formulario
  const onSubmit = async (data: ServiceFormValues) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el servicio")
      }

      toast({
        title: "Servicio actualizado",
        description: "El servicio ha sido actualizado exitosamente",
      })

      router.push("/dashboard/services")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el servicio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para agregar una nueva característica
  const addFeature = () => {
    if (newFeature.trim() === "") return

    const currentFeatures = form.getValues("features")
    form.setValue("features", [...currentFeatures, newFeature])
    setNewFeature("")
  }

  // Función para eliminar una característica
  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues("features")
    form.setValue(
      "features",
      currentFeatures.filter((_, i) => i !== index),
    )
  }

  // Función para generar slug a partir del título
  const generateSlug = () => {
    const title = form.getValues("title")
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
      form.setValue("slug", slug)
    }
  }

  // Verificar si el usuario tiene permiso para gestionar contenido
  const canManageContent = session?.user.permissions.includes("manage_content")

  if (status === "loading" || isLoadingData) {
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
          <h1 className="text-3xl font-bold tracking-tight">Editar servicio</h1>
          <p className="text-muted-foreground">
            Actualiza la información del servicio que se muestra en la página principal.
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

  if (!service) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar servicio</h1>
          <p className="text-muted-foreground">
            Actualiza la información del servicio que se muestra en la página principal.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Servicio no encontrado</CardTitle>
            <CardDescription>El servicio que intentas editar no existe.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/services">Volver a la lista de servicios</Link>
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
          <Link href="/dashboard/services">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar servicio</h1>
          <p className="text-muted-foreground">
            Actualiza la información del servicio que se muestra en la página principal.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del servicio</CardTitle>
          <CardDescription>Actualiza la información del servicio {service.title}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Estrategia Digital" {...field} />
                    </FormControl>
                    <FormDescription>Título del servicio.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="estrategia-digital" {...field} />
                      </FormControl>
                      <FormDescription>Identificador único para URLs.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="outline" className="mt-8" onClick={generateSlug}>
                  Generar desde título
                </Button>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción corta</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Breve descripción del servicio..." className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormDescription>Descripción breve que aparecerá en las tarjetas de servicios.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción larga</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción detallada del servicio..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descripción detallada que aparecerá en la página de detalle del servicio.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icono</FormLabel>
                    <FormControl>
                      <Input placeholder="Globe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nombre del icono de Lucide React (Globe, MessageSquare, Database, etc.).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="features"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Características</FormLabel>
                        <FormDescription>Lista de características del servicio.</FormDescription>
                      </div>

                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Nueva característica"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addFeature()
                            }
                          }}
                        />
                        <Button type="button" onClick={addFeature} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {form.watch("features").length === 0 ? (
                          <p className="text-sm text-muted-foreground">No hay características agregadas.</p>
                        ) : (
                          form.watch("features").map((feature, index) => (
                            <div key={index} className="flex items-center justify-between rounded-md border p-2">
                              <span>{feature}</span>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                      Número que determina el orden de aparición. Los números más bajos aparecen primero.
                    </FormDescription>
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
                      <FormLabel>Servicio activo</FormLabel>
                      <FormDescription>
                        Si está marcado, el servicio se mostrará en la página principal.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/services">Cancelar</Link>
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

