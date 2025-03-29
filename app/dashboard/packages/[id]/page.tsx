"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface FeatureGroup {
  category: string
  items: string[]
}

interface Package {
  _id: string
  name: string
  title: string
  description: string
  price: number
  currency: string
  interval: string
  features: FeatureGroup[]
  isPopular: boolean
  isActive: boolean
  displayOrder: number
}

export default function EditPackagePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Package | null>(null)

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(`/api/packages/${params.id}`)
        const data = await response.json()

        if (response.ok) {
          setFormData(data.package)
        } else {
          toast({
            title: "Error",
            description: data.error || "No se pudo cargar el paquete",
            variant: "destructive",
          })
          router.push("/dashboard/packages")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar el paquete",
          variant: "destructive",
        })
        router.push("/dashboard/packages")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchPackage()
    }
  }, [params.id, router, status])

  // Verificar si el usuario tiene permiso para gestionar contenido
  const canManageContent = session?.user.permissions.includes("manage_content")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => (prev ? { ...prev, [name]: checked } : null))
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value) || 0
    setFormData((prev) => (prev ? { ...prev, price: value } : null))
  }

  const handleFeatureCategoryChange = (index: number, value: string) => {
    if (!formData) return
    const updatedFeatures = [...formData.features]
    updatedFeatures[index].category = value
    setFormData({ ...formData, features: updatedFeatures })
  }

  const handleFeatureItemChange = (featureIndex: number, itemIndex: number, value: string) => {
    if (!formData) return
    const updatedFeatures = [...formData.features]
    updatedFeatures[featureIndex].items[itemIndex] = value
    setFormData({ ...formData, features: updatedFeatures })
  }

  const addFeatureItem = (featureIndex: number) => {
    if (!formData) return
    const updatedFeatures = [...formData.features]
    updatedFeatures[featureIndex].items.push("")
    setFormData({ ...formData, features: updatedFeatures })
  }

  const removeFeatureItem = (featureIndex: number, itemIndex: number) => {
    if (!formData) return
    const updatedFeatures = [...formData.features]
    updatedFeatures[featureIndex].items.splice(itemIndex, 1)
    setFormData({ ...formData, features: updatedFeatures })
  }

  const addFeatureGroup = () => {
    if (!formData) return
    setFormData({
      ...formData,
      features: [...formData.features, { category: "", items: [""] }],
    })
  }

  const removeFeatureGroup = (index: number) => {
    if (!formData) return
    const updatedFeatures = [...formData.features]
    updatedFeatures.splice(index, 1)
    setFormData({ ...formData, features: updatedFeatures })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData) return

    // Validar datos requeridos
    if (!formData.name || !formData.title || !formData.description || formData.price <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    // Validar que todas las categorías y elementos de características tengan contenido
    const hasEmptyFeatures = formData.features.some(
      (feature) => !feature.category || feature.items.some((item) => !item),
    )

    if (hasEmptyFeatures) {
      toast({
        title: "Error",
        description: "Todas las categorías y elementos de características deben tener contenido",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/packages/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Paquete actualizado correctamente",
        })
        router.push("/dashboard/packages")
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
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Editar Paquete</h1>
          <p className="text-muted-foreground">Actualiza la información del paquete.</p>
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

  if (!formData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Paquete</h1>
          <p className="text-muted-foreground">Actualiza la información del paquete.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>No se pudo cargar la información del paquete.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Paquete</h1>
          <p className="text-muted-foreground">Actualiza la información del paquete.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/packages">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>Información general del paquete que se mostrará en la página principal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre interno</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ej: paquete_basico"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Nombre interno para identificar el paquete (no visible para usuarios)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ej: IMPULSO"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-sm text-muted-foreground">Título visible del paquete</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe brevemente el paquete..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handlePriceChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <select
                    id="currency"
                    name="currency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.currency}
                    onChange={handleInputChange}
                  >
                    <option value="mxn">MXN</option>
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interval">Intervalo</Label>
                  <select
                    id="interval"
                    name="interval"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.interval}
                    onChange={handleInputChange}
                  >
                    <option value="mes">Mes</option>
                    <option value="año">Año</option>
                    <option value="proyecto">Proyecto</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPopular"
                    checked={formData.isPopular}
                    onCheckedChange={(checked) => handleSwitchChange("isPopular", checked)}
                  />
                  <Label htmlFor="isPopular">Destacar como popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Activo</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Características del paquete</CardTitle>
              <CardDescription>
                Agrupa las características por categorías para mostrarlas en la página principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Grupo de características {featureIndex + 1}</h3>
                    {formData.features.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFeatureGroup(featureIndex)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`category-${featureIndex}`}>Categoría</Label>
                    <Input
                      id={`category-${featureIndex}`}
                      placeholder="Ej: Estrategia Digital"
                      value={feature.category}
                      onChange={(e) => handleFeatureCategoryChange(featureIndex, e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">Nombre de la categoría para agrupar características</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Elementos</Label>
                    {feature.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-2">
                        <Input
                          placeholder="Ej: Auditoría digital"
                          value={item}
                          onChange={(e) => handleFeatureItemChange(featureIndex, itemIndex, e.target.value)}
                          required
                        />
                        {feature.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeatureItem(featureIndex, itemIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => addFeatureItem(featureIndex)}>
                      <Plus className="h-4 w-4 mr-2" /> Agregar elemento
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addFeatureGroup}>
                <Plus className="h-4 w-4 mr-2" /> Agregar grupo de características
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard/packages">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

