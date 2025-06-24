import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { RecaptchaProvider } from "@/components/recaptcha-provider"
import { SessionProvider } from "@/components/session-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Facebook, Phone, Instagram } from "lucide-react"
import Link from "next/link"
import "@/styles/globals.css"
import {
  generateMetadata as generateSEOMetadata,
  defaultSEOConfig,
  generateOrganizationSchema,
  generateWebsiteSchema,
} from "@/lib/seo"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = generateSEOMetadata(defaultSEOConfig)

// Add structured data to the layout:
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = generateOrganizationSchema()
  const websiteSchema = generateWebsiteSchema()

  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />

        {/* Additional SEO tags */}
        <link rel="canonical" href="https://kothler.com" />
        <meta name="geo.region" content="MX-JAL" />
        <meta name="geo.placename" content="Guadalajara" />
        <meta name="geo.position" content="20.6597;-103.3496" />
        <meta name="ICBM" content="20.6597, -103.3496" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
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
                          href="https://www.instagram.com/kothler.mkt"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 text-gray-400 hover:text-white"
                        >
                          <Instagram size={20} />
                          <span>Instagram</span>
                        </a>
                        <a
                          href="https://www.facebook.com/profile.php?id=61574062746873"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 text-gray-400 hover:text-white"
                        >
                          <Facebook size={20} />
                          <span>Facebook</span>
                        </a>
                        <a
                          href="https://wa.link/dcahgn"
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
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">Contacto</h3>
                      <ul className="space-y-2">
                        <li className="text-gray-400">Guadalajara, México</li>
                        <li className="text-gray-400">+52 33 20395094</li>
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
