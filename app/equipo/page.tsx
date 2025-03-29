import Image from "next/image"
import Link from "next/link"
import { Github, Globe, Linkedin, Twitter, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import dbConnect from "@/lib/mongodb"
import Profile from "@/lib/models/profile"

interface ProfileData {
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

async function getTeamProfiles() {
  await dbConnect()

  // Obtener solo perfiles públicos
  const profiles = await Profile.find({ isPublic: true })
    .populate("userId", "name email")
    .sort({ displayOrder: 1, createdAt: -1 })

  // Convertir a objetos planos para serialización
  return JSON.parse(JSON.stringify(profiles))
}

export default async function TeamPage() {
  const teamProfiles: ProfileData[] = await getTeamProfiles()

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-[#000000] to-[#000000d5] text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Nuestro Equipo
              </h1>
              <p className="max-w-[700px] text-gray-300 md:text-xl">
                Conoce a los profesionales detrás de nuestras soluciones tecnológicas. Un equipo apasionado y con amplia
                experiencia en el sector.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teamProfiles.length > 0 ? (
              teamProfiles.map((member) => (
                <Card key={member._id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.userId.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold">{member.userId.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.position}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.bio}</p>
                      <div className="flex space-x-4">
                        {member.links.portfolio && (
                          <Link href={member.links.portfolio} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Globe className="h-4 w-4" />
                              <span className="sr-only">Portafolio</span>
                            </Button>
                          </Link>
                        )}
                        {member.links.linkedin && (
                          <Link href={member.links.linkedin} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Linkedin className="h-4 w-4" />
                              <span className="sr-only">LinkedIn</span>
                            </Button>
                          </Link>
                        )}
                        {member.links.twitter && (
                          <Link href={member.links.twitter} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Twitter className="h-4 w-4" />
                              <span className="sr-only">Twitter</span>
                            </Button>
                          </Link>
                        )}
                        {member.links.instagram && (
                          <Link href={member.links.instagram} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Instagram className="h-4 w-4" />
                              <span className="sr-only">Instagram</span>
                            </Button>
                          </Link>
                        )}
                        {member.links.github && (
                          <Link href={member.links.github} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Github className="h-4 w-4" />
                              <span className="sr-only">GitHub</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No hay miembros del equipo para mostrar en este momento.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Join Our Team Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                ¿Quieres unirte a nuestro equipo?
              </h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Estamos siempre en búsqueda de talento apasionado por la tecnología y la innovación.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="#contacto">
                <Button className="bg-primary hover:bg-primary/90">Trabaja con nosotros</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

