"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle, Code, Database, Globe, MessageSquare, Phone, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ContactForm from "@/components/contact-form"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

// Interfaces para los datos dinámicos
interface Service {
  _id: string
  title: string
  description: string
  longDescription: string
  icon: string
  features: string[]
  slug: string
  isActive: boolean
  displayOrder: number
}

interface Project {
  _id: string
  title: string
  description: string
  images: string[]
  category: string
  client: string
  technologies: string[]
  link?: string
  isActive: boolean
  displayOrder: number
}

interface Package {
  _id: string
  name: string
  title: string
  description: string
  price: number
  currency: string
  interval: string
  features: {
    category: string
    items: string[]
  }[]
  isPopular: boolean
  isActive: boolean
  displayOrder: number
}

interface Feature {
  _id: string
  title: string
  description: string
  icon: string
  isActive: boolean
  displayOrder: number
}

// Componente para renderizar el icono dinámicamente
const DynamicIcon = ({ name }: { name: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Globe: <Globe className="h-8 w-8 text-primary" />,
    MessageSquare: <MessageSquare className="h-8 w-8 text-primary" />,
    Database: <Database className="h-8 w-8 text-primary" />,
    Code: <Code className="h-8 w-8 text-primary" />,
    Phone: <Phone className="h-8 w-8 text-primary" />,
    Server: <Server className="h-8 w-8 text-primary" />,
    ArrowRight: <ArrowRight className="h-8 w-8 text-primary" />,
    CheckCircle: <CheckCircle className="h-8 w-8 text-primary" />,
  }

  return icons[name] || <Globe className="h-8 w-8 text-primary" />
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [isLoading, setIsLoading] = useState({
    services: true,
    projects: true,
    packages: true,
    features: true,
  })

  // Cargar servicios
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services?active=true")
        if (response.ok) {
          const data = await response.json()
          setServices(data.services)
        }
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setIsLoading((prev) => ({ ...prev, services: false }))
      }
    }

    fetchServices()
  }, [])

  // Cargar proyectos
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects?active=true")
        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects)
        }
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setIsLoading((prev) => ({ ...prev, projects: false }))
      }
    }

    fetchProjects()
  }, [])

  // Cargar paquetes
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch("/api/packages?active=true")
        if (response.ok) {
          const data = await response.json()
          setPackages(data.packages)
        }
      } catch (error) {
        console.error("Error fetching packages:", error)
      } finally {
        setIsLoading((prev) => ({ ...prev, packages: false }))
      }
    }

    fetchPackages()
  }, [])

  // Cargar características
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch("/api/features?active=true")
        if (response.ok) {
          const data = await response.json()
          setFeatures(data.features)
        }
      } catch (error) {
        console.error("Error fetching features:", error)
      } finally {
        setIsLoading((prev) => ({ ...prev, features: false }))
      }
    }

    fetchFeatures()
  }, [])

  // Primero, agregar más servicios de ejemplo al fallback para tener al menos 6
  const fallbackServices = [
    {
      _id: "1",
      title: "Estrategia Digital",
      description:
        "Analizamos tu mercado, revisamos a tu competencia y entendemos a tu público para definir el mejor plan de acción.",
      icon: "Globe",
      features: [
        "Auditoría digital",
        "Planificación estratégica",
        "Definición de Buyer Persona",
        "Consultoría y asesoramiento continuo",
      ],
      slug: "estrategia-digital",
      isActive: true,
      displayOrder: 0,
      longDescription: "",
    },
    {
      _id: "2",
      title: "Social Media",
      description: "Creamos contenido atractivo y relevante para conectar con los usuarios y fortalecer tu comunidad.",
      icon: "MessageSquare",
      features: [
        "Creación y gestión de contenido",
        "Publicaciones y calendarios",
        "Community management",
        "Campañas de crecimiento y engagement",
      ],
      slug: "social-media",
      isActive: true,
      displayOrder: 1,
      longDescription: "",
    },
    {
      _id: "3",
      title: "Publicidad Digital",
      description: "Afinamos tus campañas para que lleguen a la gente correcta y se conviertan en resultados reales.",
      icon: "Database",
      features: [
        "Creación y optimización de anuncios",
        "Segmentación de audiencias",
        "Remarketing y retargeting",
        "Análisis y optimización de campañas",
      ],
      slug: "publicidad-digital",
      isActive: true,
      displayOrder: 2,
      longDescription: "",
    },
    {
      _id: "4",
      title: "Marketing de Contenidos",
      description: "Diseñamos estrategias que posicionan a tu marca como referente en su sector.",
      icon: "Code",
      features: [
        "Blogs y artículos optimizados para SEO",
        "Infografías y material descargable",
        "Estrategia de storytelling",
        "Desarrollo de guiones y redacción creativa",
      ],
      slug: "marketing-contenidos",
      isActive: true,
      displayOrder: 3,
      longDescription: "",
    },
    {
      _id: "5",
      title: "Producción Audiovisual",
      description: "Damos vida a tus ideas con contenido visual y sonoro de alto impacto.",
      icon: "Phone",
      features: [
        "Producción de videos corporativos",
        "Grabación de comerciales",
        "Fotografía profesional",
        "Producción y masterización de audio",
      ],
      slug: "produccion-audiovisual",
      isActive: true,
      displayOrder: 4,
      longDescription: "",
    },
    {
      _id: "6",
      title: "Diseño y Branding",
      description: "Construimos una identidad visual sólida y atractiva que represente la esencia de tu negocio.",
      icon: "Server",
      features: [
        "Creación de logotipos",
        "Manuales de identidad visual",
        "Diseño de materiales corporativos",
        "Diseño para redes sociales",
      ],
      slug: "diseno-branding",
      isActive: true,
      displayOrder: 5,
      longDescription: "",
    },
  ]

  // Usar datos reales o fallback según el estado de carga, limitando a 6 servicios
  const displayServices = (services.length > 0 ? services : fallbackServices).slice(0, 6)

  const fallbackProjects = Array.from({ length: 6 }, (_, i) => ({
    _id: `${i + 1}`,
    title: `Proyecto ${i + 1}`,
    description:
      i % 2 === 0
        ? "Sistema de gestión para restaurante con módulos de pedidos, inventario y fidelización."
        : "Sitio web corporativo con integración de CRM y sistema de reservas online.",
    images: [`/placeholder.svg?height=300&width=400&text=Proyecto ${i + 1}`],
    category: "Web",
    client: "Cliente Ejemplo",
    technologies: ["React", "Node.js"],
    isActive: true,
    displayOrder: i,
  }))

  const fallbackPackages = [
    {
      _id: "1",
      name: "IMPULSO",
      title: "IMPULSO",
      description:
        "Ideal para negocios que inician su presencia digital y buscan establecer una base sólida en redes sociales con una estrategia definida.",
      price: 6000,
      currency: "mxn",
      interval: "mes",
      features: [
        {
          category: "Estrategia Digital",
          items: ["Auditoría digital", "Planificación estratégica", "Benchmarking"],
        },
        {
          category: "Social Media",
          items: [
            "Creación y gestión de contenido (7 post al mes + Edición de 1 video)",
            "Community Management",
            "Publicaciones y calendario editorial",
          ],
        },
        {
          category: "Analítica y reportes",
          items: ["Reportes mensuales de comportamiento de redes sociales"],
        },
      ],
      isPopular: false,
      isActive: true,
      displayOrder: 0,
    },
    {
      _id: "2",
      name: "CONEXIÓN",
      title: "CONEXIÓN",
      description:
        "Para negocios que buscan fortalecer su presencia digital con estrategias de contenido y publicidad pagada.",
      price: 7500,
      currency: "mxn",
      interval: "mes",
      features: [
        {
          category: "Todo lo incluido en el Paquete Impulso +",
          items: [],
        },
        {
          category: "Social Media",
          items: [
            "Creación y gestión de contenido (10 post al mes + Edición de 2 videos)",
            "Community Management con interacción y respuestas rápidas",
            "Campañas de crecimiento y engagement",
          ],
        },
        {
          category: "Publicidad Digital",
          items: ["Creación y optimización de anuncios (Meta, Google o LinkedIn)", "Segmentación de audiencias"],
        },
        {
          category: "Marketing de Contenidos",
          items: ["Blogs y artículos optimizados para SEO (1 artículo al mes)"],
        },
        {
          category: "Analítica y Reportes",
          items: ["Dashboards personalizados", "Reportes mensuales con KPIs detallados"],
        },
      ],
      isPopular: true,
      isActive: true,
      displayOrder: 1,
    },
    {
      _id: "3",
      name: "EXPANSIÓN",
      title: "EXPANSIÓN",
      description:
        "La solución completa para marcas que buscan un crecimiento con contenido premium, publicidad efectiva y análisis detallado.",
      price: 9000,
      currency: "mxn",
      interval: "mes",
      features: [
        {
          category: "Todo lo incluido en el Paquete Conexión +",
          items: [],
        },
        {
          category: "Publicidad Digital",
          items: [
            "Optimización avanzada de segmentación y audiencias dinámicas para mejorar el rendimiento publicitario",
          ],
        },
        {
          category: "Marketing de Contenidos",
          items: ["Estrategia de storytelling", "Infografías y material descargable"],
        },
        {
          category: "Producción Audiovisual",
          items: [
            "Producción completa de videos cortos para redes (hasta 4 al mes)",
            "Fotografía profesional (1 sesión cada 3 meses)",
          ],
        },
        {
          category: "Diseño y Branding",
          items: ["Diseño de materiales corporativos (brochures, presentaciones básicas)"],
        },
        {
          category: "Analítica y Reportes",
          items: ["Análisis avanzado con optimización de estrategias"],
        },
      ],
      isPopular: false,
      isActive: true,
      displayOrder: 2,
    },
  ]

  const fallbackFeatures = [
    {
      _id: "1",
      title: "Experiencia Comprobada",
      description: "Más de 10 clientes satisfechos con proyectos exitosos en diversos sectores de la industria.",
      icon: "CheckCircle",
      isActive: true,
      displayOrder: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      title: "Soluciones a Medida",
      description: "Cada proyecto se adapta perfectamente a las necesidades específicas de tu negocio.",
      icon: "CheckCircle",
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "3",
      title: "Tecnología de Vanguardia",
      description: "Utilizamos las últimas tecnologías para garantizar sistemas rápidos, seguros y escalables.",
      icon: "CheckCircle",
      isActive: true,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "4",
      title: "Soporte Continuo",
      description: "Ofrecemos asistencia técnica permanente para asegurar el funcionamiento óptimo de tus sistemas.",
      icon: "CheckCircle",
      isActive: true,
      displayOrder: 3,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "5",
      title: "Enfoque en Resultados",
      description: "Nos comprometemos con el éxito de tu negocio, midiendo el impacto real de nuestras soluciones.",
      icon: "CheckCircle",
      isActive: true,
      displayOrder: 4,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "6",
      title: "Equipo Especializado",
      description: "Contamos con profesionales certificados en diversas áreas del desarrollo de software.",
      icon: "CheckCircle",
      isActive: true,
      displayOrder: 5,
      createdAt: new Date().toISOString(),
    },
  ]

  // Usar datos reales o fallback según el estado de carga
  const displayProjects = projects.length > 0 ? projects : fallbackProjects
  const displayPackages = packages.length > 0 ? packages : fallbackPackages
  const displayFeatures = features.length > 0 ? features : fallbackFeatures

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-[#000000] to-[#000000d5] text-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Estrategias claras y precisas para impulsar tu marca.
                </h1>
                <p className="max-w-[600px] text-gray-300 md:text-xl">
                  Combinamos experiencia, innovación y pasión digital para transformar y hacer crecer tu negocio.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="#contacto">
                  <Button className="bg-primary hover:bg-primary/90">
                    Solicitar cotización <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/servicios">
                  <Button variant="outline" className="border-white text-black hover:bg-white/10">
                    Nuestros servicios
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto lg:mx-0 relative">
              <Image
                src="/logo.svg?height=500&width=500"
                width={500}
                height={500}
                alt="Dashboard de software"
                className="rounded-lg object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nuestros Servicios</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Soluciones estratégicas y creativas para impulsar tu presencia digital y fortalecer tu marca.
              </p>
            </div>
          </div>

          {/* En la sección de renderizado de servicios, modificar la estructura de las tarjetas: */}
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {displayServices.map((service) => (
              <Card key={service._id} className="overflow-hidden flex flex-col h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <DynamicIcon name={service.icon} />
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <CardDescription className="text-base mb-4">{service.description}</CardDescription>
                  <ul className="space-y-1 text-sm mb-6 flex-grow">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 mt-auto">
                    <Link href={`/servicios?servicio=${service.slug}`}>
                      <Button variant="outline" size="sm">
                        Más información
                      </Button>
                    </Link>
                    <Link
                      href="#contacto"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          localStorage.setItem("selectedService", service.title)
                        }
                      }}
                    >
                      <Button size="sm">Solicitar</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link href="/servicios">
              <Button className="bg-primary hover:bg-primary/90">
                Ver todos los servicios <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portafolio" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nuestro Portafolio</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Conoce algunos de nuestros proyectos más destacados y cómo hemos ayudado a nuestros clientes a crecer.
              </p>
            </div>
          </div>

          {/* Carousel para proyectos */}
          <div className="mx-auto max-w-5xl mt-12">
            <Carousel className="w-full">
              <CarouselContent>
                {displayProjects.map((project) => (
                  <CarouselItem key={project._id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <div className="overflow-hidden rounded-lg border bg-white shadow-sm h-full flex flex-col">
                        <div className="relative aspect-video">
                          <Image
                            src={project.images[0] || "/placeholder.svg"}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <p className="text-sm text-gray-500 mt-1 flex-1">{project.description}</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="relative translate-y-0 mr-2" />
                <CarouselNext className="relative translate-y-0" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="paquetes" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nuestros Paquetes</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Soluciones mensuales diseñadas para diferentes etapas de crecimiento digital
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
            {displayPackages.map((pkg) => (
              <Card
                key={pkg._id}
                className={`flex flex-col overflow-hidden ${
                  pkg.isPopular
                    ? "border-2 border-primary transition-all hover:shadow-md relative"
                    : "border-2 border-primary/20 transition-all hover:shadow-md"
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                    Popular
                  </div>
                )}
                <CardHeader className={pkg.isPopular ? "bg-primary/10 pb-4" : "bg-primary/5 pb-4"}>
                  <div className="text-sm font-medium text-primary mb-1">IGUALA MENSUAL</div>
                  <CardTitle className="text-2xl">{pkg.title}</CardTitle>
                  <CardDescription className="mt-1.5">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-6">
                  <div className="space-y-4">
                    {pkg.features.map((featureGroup, groupIndex) => (
                      <div key={groupIndex}>
                        {featureGroup.category && (
                          <h4 className="font-semibold flex items-center text-primary">
                            {groupIndex === 0 ? (
                              <Globe className="h-4 w-4 mr-2" />
                            ) : groupIndex === 1 ? (
                              <MessageSquare className="h-4 w-4 mr-2" />
                            ) : groupIndex === 2 ? (
                              <Database className="h-4 w-4 mr-2" />
                            ) : groupIndex === 3 ? (
                              <Code className="h-4 w-4 mr-2" />
                            ) : groupIndex === 4 ? (
                              <Phone className="h-4 w-4 mr-2" />
                            ) : (
                              <ArrowRight className="h-4 w-4 mr-2" />
                            )}
                            {featureGroup.category}:
                          </h4>
                        )}
                        {featureGroup.items.length > 0 && (
                          <ul className="mt-2 space-y-1 text-sm">
                            {featureGroup.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${pkg.price.toLocaleString()}</span>
                    <span className="text-gray-500 ml-1">
                      {pkg.currency}/{pkg.interval}
                    </span>
                  </div>
                  <Link
                    href="#contacto"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.setItem("selectedService", `Paquete ${pkg.title}`)
                      }
                    }}
                  >
                    <Button className="w-full">Contratar</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 max-w-3xl mx-auto">
              <strong>NOTA:</strong> Cada paquete puede personalizarse según las necesidades específicas de tu negocio.
              Si necesitas algún servicio adicional que no esté incluido, podemos cotizarlo por separado.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="nosotros" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">¿Por qué elegirnos?</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Nos destacamos por ofrecer soluciones tecnológicas de calidad con un enfoque centrado en resultados.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
            {displayFeatures.map((feature) => (
              <div key={feature._id} className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <DynamicIcon name={feature.icon} />
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                </div>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Contáctanos</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Estamos listos para ayudarte a transformar tu negocio con soluciones tecnológicas a medida.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2 mt-12">
            <ContactForm />
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">Información de contacto</h3>
                <p className="text-gray-500 mt-2">Completa el formulario o contáctanos directamente a través de:</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <p className="text-gray-500">+123 456 7890</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-500">contacto@kothler.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Dirección</p>
                    <p className="text-gray-500">Calle Principal 123, Ciudad, País</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Síguenos en redes sociales</h4>
                <div className="flex gap-4">
                  <Link href="#" className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="sr-only">Facebook</span>
                  </Link>
                  <Link href="#" className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="currentColor"
                      viewBox="-0.5 0 17 17"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />{" "}
                    </svg>
                    <span className="sr-only">Twitter</span>
                  </Link>
                  <Link href="#" className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="currentColor"
                      viewBox="-0.5 0 16 16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />{" "}
                    </svg>
                    <span className="sr-only">Instagram</span>
                  </Link>
                  <Link
                    href="https://www.linkedin.com/company/nexiuslat/"
                    className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
                  >
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

