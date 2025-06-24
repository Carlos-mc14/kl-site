"use client"

import Link from "next/link"
import { ArrowLeft, CheckCircle, Globe, Database, Code, Phone, Server, MessageSquare, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { generateMetadata as generateSEOMetadata, pageSEOConfigs } from "@/lib/seo"

export async function generateMetadata() {
  return generateSEOMetadata(pageSEOConfigs.services)
}


interface SearchParams {
  servicio?: string
}

export default function ServiciosPage(searchParams: SearchParams) {
  const servicioSeleccionado = searchParams?.servicio || null

  const servicios = [
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Estrategia Digital",
      description:
        "Analizamos tu mercado, revisamos a tu competencia y entendemos a tu público para definir el mejor plan de acción, alineado 100% a tus objetivos.",
      features: [
        "Auditoría digital",
        "Planificación estratégica",
        "Definición de Buyer Persona",
        "Consultoría y asesoramiento continuo",
      ],
      longDescription:
        "Nuestra estrategia digital comienza con un análisis profundo de tu mercado y competencia. Identificamos oportunidades y definimos un plan de acción personalizado que se alinea perfectamente con tus objetivos de negocio. Trabajamos de manera continua para ajustar la estrategia según los resultados y las tendencias del mercado.",
      id: "estrategia-digital",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Social Media",
      description:
        "Las redes sociales no son solo post que no le aportan nada a tu audiencia. Creamos contenido atractivo y relevante para conectar con los usuarios y fortalecer tu comunidad.",
      features: [
        "Creación y gestión de contenido",
        "Publicaciones y calendarios",
        "Community management",
        "Campañas de crecimiento y engagement",
      ],
      longDescription:
        "Desarrollamos estrategias de social media que van más allá de simples publicaciones. Creamos contenido que resuena con tu audiencia, gestionamos la interacción diaria con tu comunidad y diseñamos campañas específicas para aumentar tu alcance y engagement. Nuestro enfoque se basa en datos para maximizar el retorno de tu inversión en redes sociales.",
      id: "social-media",
    },
    {
      icon: <Database className="h-8 w-8 text-primary" />,
      title: "Publicidad Digital",
      description:
        "Nada de tiros al aire, cada peso que metes en publicidad tiene que trabajar para ti, así que afinamos tus campañas para que lleguen a la gente correcta y se conviertan en resultados reales.",
      features: [
        "Creación y optimización de anuncios",
        "Segmentación de audiencias",
        "Remarketing y retargeting",
        "Análisis y optimización de campañas",
      ],
      longDescription:
        "Nuestra publicidad digital se enfoca en maximizar el retorno de tu inversión. Creamos anuncios impactantes, definimos segmentaciones precisas y optimizamos constantemente para mejorar los resultados. Utilizamos técnicas avanzadas de remarketing para reconectar con usuarios interesados y convertir más visitas en ventas o leads cualificados.",
      id: "publicidad-digital",
    },
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "Marketing de Contenidos",
      description:
        "Nos gusta contar historias que enganchen, informen y generen valor. Diseñamos estrategias que posicionan a tu marca como referente en su sector.",
      features: [
        "Blogs y artículos optimizados para SEO",
        "Infografías y material descargable",
        "Estrategia de storytelling",
        "Desarrollo de guiones y redacción creativa",
      ],
      longDescription:
        "Nuestro marketing de contenidos se basa en crear material valioso que posicione a tu marca como autoridad en tu industria. Desarrollamos contenido optimizado para SEO que atrae tráfico cualificado, creamos recursos descargables que generan leads y diseñamos narrativas que conectan emocionalmente con tu audiencia.",
      id: "marketing-contenidos",
    },
    {
      icon: <Phone className="h-8 w-8 text-primary" />,
      title: "Producción Audiovisual",
      description:
        "Si una imagen vale más que mil palabras, imagina lo que podemos hacer con una buena producción audiovisual. Damos vida a tus ideas con contenido visual y sonoro de alto impacto.",
      features: [
        "Producción de videos corporativos y promocionales",
        "Grabación de comerciales",
        "Fotografía profesional",
        "Producción de singles",
        "Mezcla y masterización de audio",
        "Grabación de voces e instrumentación",
      ],
      longDescription:
        "Nuestra producción audiovisual abarca desde videos corporativos hasta comerciales de alta calidad. Contamos con un equipo de profesionales en fotografía, videografía y producción de audio para crear contenido multimedia que destaque tu marca. Cada proyecto se desarrolla con atención al detalle y enfoque en transmitir tu mensaje de manera efectiva.",
      id: "produccion-audiovisual",
    },
    {
      icon: <Server className="h-8 w-8 text-primary" />,
      title: "Diseño y Branding",
      description:
        "Tu marca no es solo un logo, es lo que la gente percibe y recuerda. Construimos una identidad visual sólida y atractiva que represente la esencia de tu negocio y lo haga destacar en el mercado.",
      features: [
        "Creación de logotipos",
        "Manuales de identidad visual",
        "Definición de paleta de colores y tipografías",
        "Diseño de materiales corporativos",
        "Diseño de post y plantillas para redes sociales",
        "Diseño publicitario",
      ],
      longDescription:
        "Nuestro servicio de diseño y branding va más allá de crear elementos visuales atractivos. Desarrollamos identidades de marca completas que comunican tus valores y conectan con tu audiencia. Desde logotipos hasta sistemas de diseño completos, creamos activos visuales coherentes que fortalecen el reconocimiento de tu marca en todos los puntos de contacto.",
      id: "diseno-branding",
    },
    {
      icon: <ArrowRight className="h-8 w-8 text-primary" />,
      title: "Analítica y Reportes",
      description:
        "Si no hay nada que medir, no podemos mejorar. Analizamos datos reales para ajustar estrategias y asegurarnos de que cada paso que damos sea en la dirección correcta.",
      features: [
        "Implementación de Google Analytics",
        "Dashboards personalizados",
        "Reportes mensuales con KPIs",
        "Análisis y optimización de estrategias",
      ],
      longDescription:
        "Nuestra analítica se centra en transformar datos en insights accionables. Implementamos sistemas de seguimiento avanzados, creamos dashboards personalizados y generamos informes detallados que muestran el rendimiento de tus estrategias digitales. Utilizamos estos datos para tomar decisiones informadas y optimizar continuamente tus campañas para mejores resultados.",
      id: "analitica-reportes",
    },
  ]

  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-gradient-to-r from-[#000000] to-[#000000d5] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nuestros Servicios</h1>
            <p className="max-w-[700px] text-gray-300 md:text-xl">
              Soluciones estratégicas y creativas para impulsar tu presencia digital y fortalecer tu marca.
            </p>
          </div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          {servicioSeleccionado ? (
            // Detailed view of selected service
            (() => {
              const servicio = servicios.find((s) => s.id === servicioSeleccionado)
              if (!servicio) return null

              return (
                <div className="max-w-4xl mx-auto">
                  <Link href="/servicios" className="inline-flex items-center mb-6 text-primary hover:underline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Todos los servicios
                  </Link>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-full bg-primary/10">{servicio.icon}</div>
                    <h2 className="text-3xl font-bold">{servicio.title}</h2>
                  </div>

                  <p className="text-lg text-gray-700 mb-8">{servicio.longDescription}</p>

                  <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="text-xl font-semibold mb-4">Qué incluye:</h3>
                    <ul className="grid gap-3 md:grid-cols-2">
                      {servicio.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/#contacto"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          localStorage.setItem("selectedService", servicio.title)
                        }
                      }}
                    >
                      <Button className="w-full sm:w-auto">
                        Solicitar este servicio <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/servicios">
                      <Button variant="outline" className="w-full sm:w-auto">
                        Ver todos los servicios
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })()
          ) : (
            // List all services
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {servicios.map((servicio, index) => (
                <Card key={index} className="overflow-hidden h-full flex flex-col">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    {servicio.icon}
                    <CardTitle>{servicio.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow pb-6">
                    <CardDescription className="text-base mb-4">{servicio.description}</CardDescription>
                    <ul className="space-y-1 text-sm mb-6">
                      {servicio.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {servicio.features.length > 4 && (
                        <li className="text-primary text-sm mt-1">+ {servicio.features.length - 4} más</li>
                      )}
                    </ul>
                    <div className="flex justify-center gap-2 mt-auto">
                      <Link
                        href="/#contacto"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            localStorage.setItem("selectedService", servicio.title)
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
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-16 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight">¿Listo para impulsar tu negocio?</h2>
              <p className="text-gray-500 max-w-[500px]">
                Contáctanos hoy mismo para una consulta gratuita y descubre cómo podemos ayudarte a alcanzar tus
                objetivos.
              </p>
            </div>
            <Link href="/#contacto">
              <Button className="w-full md:w-auto">
                Solicitar cotización <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

