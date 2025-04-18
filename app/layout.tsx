import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { RecaptchaProvider } from "@/components/recaptcha-provider"
import { SessionProvider } from "@/components/session-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Github, Linkedin, Facebook, Phone } from "lucide-react"
import Link from "next/link"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kothler | Presicion Y Crecimiento",
  description:
    "Desarrollamos software a medida, sitios web y sistemas especializados para restaurantes, hoteles y más.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SessionProvider>
            <RecaptchaProvider>
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Navbar />
              </header>

              {children}
              <footer className="w-full py-6 md:py-0 bg-[#000000ea] text-white">
                <div className="container px-4 md:px-6">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-4 py-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">Kothler</h3>
                      <p className="text-gray-400">Soluciones digitales que transforman tu negocio.</p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">Nuestras redes</h3>
                      <div className="space-y-2">
                        <a
                          href="https://linkedin.com/in/asdasd"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 text-gray-400 hover:text-white"
                        >
                          <Linkedin size={20} />
                          <span>Linkedin</span>
                        </a>
                        <a
                          href="https://github.com/asdasd"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 text-gray-400 hover:text-white"
                        >
                          <Github size={20} />
                          <span>Github</span>
                        </a>
                        <a
                          href="https://instagram.com/asdasd"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 text-gray-400 hover:text-white"
                        >
                          <Facebook size={20} />
                          <span>Facebook</span>
                        </a>
                        <a
                          href="https://instagram.com/asdasd"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 text-gray-400 hover:text-white"
                        >
                          <Phone size={20} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">Empresa</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link href="#nosotros" className="text-gray-400 hover:text-white">
                            Sobre Nosotros
                          </Link>
                        </li>
                        <li>
                          <Link href="/equipo" className="text-gray-400 hover:text-white">
                            Equipo
                          </Link>
                        </li>
                        <li>
                          <Link href="#portafolio" className="text-gray-400 hover:text-white">
                            Portafolio
                          </Link>
                        </li>
                        <li>
                          <Link href="#testimonios" className="text-gray-400 hover:text-white">
                            Testimonios
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">Contacto</h3>
                      <ul className="space-y-2">
                        <li className="text-gray-400">Lima, Lima, Perú</li>
                        <li className="text-gray-400">+51 999 999 999</li>
                        <li className="text-gray-400">contacto@kothler.com</li>
                      </ul>
                    </div>
                  </div>
                  <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-400">
                    <p>© {new Date().getFullYear()} Kothler. Todos los derechos reservados.</p>
                  </div>
                </div>
              </footer>
            </RecaptchaProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

