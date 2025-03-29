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
import { Loader2, ArrowLeft, Plus, X, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Esquema de validación
const projectSchema = z.object({
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  images: z.array(z.string()).min(1, { message: "Se requiere al menos una imagen" }),
  category: z.string().min(1, { message: "La categoría es requerida" }),
  client: z.string().min(1, { message: "El cliente es requerido" }),
  completionDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La fecha de finalización debe ser una fecha válida",
  }),
  link: z.string().optional(),
  displayOrder: z.number(),
  isActive: z.boolean().default(true),
})

type ProjectFormValues = z.infer<typeof projectSchema>

export default function NewProjectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [newTechnology, setNewTechnology] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState("")

  // Inicializar formulario
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      images: [],
      category: "",
      client: "",
      completionDate: new Date().toISOString().split("T")[0],
      link: "",
      displayOrder: 0,
      isActive: true,
    },
  })

  // Manejar envío del formulario
  const onSubmit = async (data: ProjectFormValues) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al crear el proyecto")
      }

      toast({
        title: "Proyecto creado",
        description: "El proyecto ha sido creado exitosamente",
      })

      router.push("/dashboard/projects")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el proyecto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }



  // Función para agregar una nueva imagen
  const addImage = () => {
    if (newImageUrl.trim() === "") return

    const currentImages = form.getValues("images")
    form.setValue("images", [...currentImages, newImageUrl])
    setImageUrls([...imageUrls, newImageUrl])
    setNewImageUrl("")
  }

  // Función para eliminar una imagen
  const removeImage = (index: number) => {
    const currentImages = form.getValues("images")
    form.setValue(
      "images",
      currentImages.filter((_, i) => i !== index),
    )
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  // Verificar si el usuario tiene permiso para gestionar contenido
  const canManageContent = session?.user.permissions.includes("manage_content")

  if (status === "loading") {
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
          <h1 className="text-3xl font-bold tracking-tight">Nuevo proyecto</h1>
          <p className="text-muted-foreground">Crea un nuevo proyecto para mostrar en la sección de portafolio.</p>
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
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo proyecto</h1>
          <p className="text-muted-foreground">Crea un nuevo proyecto para mostrar en la sección de portafolio.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del proyecto</CardTitle>
          <CardDescription>
            Completa la información del proyecto que se mostrará en la sección de portafolio.
          </CardDescription>
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
                      <Input placeholder="Ej: Sitio web para Restaurante XYZ" {...field} />
                    </FormControl>
                    <FormDescription>Título del proyecto.</FormDescription>
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
                      <Textarea placeholder="Descripción del proyecto..." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormDescription>Descripción detallada del proyecto.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="images"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Imágenes</FormLabel>
                        <FormDescription>Agrega las URLs de las imágenes del proyecto.</FormDescription>
                      </div>

                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="URL de la imagen"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addImage()
                            }
                          }}
                        />
                        <Button type="button" onClick={addImage} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {form.watch("images").length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                          {form.watch("images").map((image, index) => (
                            <div key={index} className="relative group">
                              <div className="relative aspect-video rounded-md overflow-hidden border">
                                <Image
                                  src={image || "/placeholder.svg"}
                                  alt={`Imagen ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {form.watch("images").length === 0 && (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md">
                          <ImageIcon className="h-10 w-10 text-gray-300 mb-2" />
                          <p className="text-sm text-muted-foreground">No hay imágenes agregadas.</p>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Desarrollo Web" {...field} />
                      </FormControl>
                      <FormDescription>Categoría del proyecto.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Restaurante XYZ" {...field} />
                      </FormControl>
                      <FormDescription>Nombre del cliente.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="completionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de finalización</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Fecha en que se completó el proyecto.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enlace (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://ejemplo.com" {...field} />
                      </FormControl>
                      <FormDescription>URL del proyecto en vivo (si está disponible).</FormDescription>
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
                      <FormLabel>Proyecto activo</FormLabel>
                      <FormDescription>
                        Si está marcado, el proyecto se mostrará en la sección de portafolio.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/projects">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar proyecto"
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

