"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2, Upload, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"

const profileSchema = z.object({
  position: z.string().min(2, "La posición debe tener al menos 2 caracteres"),
  bio: z.string().min(10, "La biografía debe tener al menos 10 caracteres"),
  image: z.string().optional(),
  links: z.object({
    linkedin: z.string().url("URL de LinkedIn inválida").optional().or(z.literal("")),
    github: z.string().url("URL de GitHub inválida").optional().or(z.literal("")),
    portfolio: z.string().url("URL de portafolio inválida").optional().or(z.literal("")),
    twitter: z.string().url("URL de Twitter inválida").optional().or(z.literal("")),
    instagram: z.string().url("URL de Instagram inválida").optional().or(z.literal("")),
  }),
  isPublic: z.boolean(),
  displayOrder: z.number().min(0),
})

type ProfileFormData = z.infer<typeof profileSchema>

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
  links: {
    linkedin?: string
    github?: string
    portfolio?: string
    twitter?: string
    instagram?: string
  }
  isPublic: boolean
  displayOrder: number
}

export default function EditProfilePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      position: "",
      bio: "",
      image: "",
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profiles/${params.id}`)
        const data = await response.json()

        if (response.ok) {
          setProfile(data.profile)
          setImagePreview(data.profile.image || "")

          // Populate form with existing data
          form.reset({
            position: data.profile.position,
            bio: data.profile.bio,
            image: data.profile.image || "",
            links: {
              linkedin: data.profile.links?.linkedin || "",
              github: data.profile.links?.github || "",
              portfolio: data.profile.links?.portfolio || "",
              twitter: data.profile.links?.twitter || "",
              instagram: data.profile.links?.instagram || "",
            },
            isPublic: data.profile.isPublic,
            displayOrder: data.profile.displayOrder,
          })
        } else {
          toast({
            title: "Error",
            description: data.error || "No se pudo cargar el perfil",
            variant: "destructive",
          })
          router.push("/dashboard/profiles")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar el perfil",
          variant: "destructive",
        })
        router.push("/dashboard/profiles")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchProfile()
    }
  }, [params.id, status, form, router])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImagePreview(result)
      form.setValue("image", result)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/profiles/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Perfil actualizado correctamente",
        })
        router.push("/dashboard/profiles")
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo actualizar el perfil",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check permissions
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
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/profiles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Perfil</h1>
            <p className="text-muted-foreground">Modifica la información del perfil.</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Acceso denegado</CardTitle>
            <CardDescription>No tienes permisos para editar perfiles.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/profiles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Perfil no encontrado</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/profiles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Perfil</h1>
          <p className="text-muted-foreground">Modifica la información del perfil de {profile.userId.name}.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información básica</CardTitle>
                <CardDescription>Información principal del perfil.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Usuario</label>
                  <p className="text-sm text-muted-foreground">
                    {profile.userId.name} ({profile.userId.email})
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posición</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Desarrollador Full Stack" {...field} />
                      </FormControl>
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
                        <Textarea
                          placeholder="Describe la experiencia y habilidades..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-4">
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Perfil público</FormLabel>
                          <FormDescription>El perfil será visible en la página pública del equipo</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
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
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Número menor aparece primero en la lista</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Imagen y enlaces</CardTitle>
                <CardDescription>Foto de perfil y redes sociales.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Imagen de perfil</label>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                      {imagePreview ? (
                        <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Upload className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2" />
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImagePreview("")
                            form.setValue("image", "")
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Quitar imagen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Enlaces sociales</h4>

                  <FormField
                    control={form.control}
                    name="links.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/usuario" {...field} />
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
                          <Input placeholder="https://github.com/usuario" {...field} />
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
                          <Input placeholder="https://miportafolio.com" {...field} />
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
                          <Input placeholder="https://twitter.com/usuario" {...field} />
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
                          <Input placeholder="https://instagram.com/usuario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/profiles">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
