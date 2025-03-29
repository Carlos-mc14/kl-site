"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Users, Shield, UserCircle, Home, Settings, LogOut, Globe, Briefcase, Package } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isAdmin = session?.user.role === "admin"

  // Modificar el array navItems para incluir las nuevas secciones de contenido
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      permission: null, // Todos pueden ver
    },
    {
      title: "Perfiles",
      href: "/dashboard/profiles",
      icon: UserCircle,
      permission: "manage_profiles",
    },
    {
      title: "Usuarios",
      href: "/dashboard/users",
      icon: Users,
      permission: "manage_users",
    },
    {
      title: "Roles",
      href: "/dashboard/roles",
      icon: Shield,
      permission: "manage_roles",
    },
    {
      title: "Servicios",
      href: "/dashboard/services",
      icon: Globe,
      permission: "manage_content",
    },
    {
      title: "Proyectos",
      href: "/dashboard/projects",
      icon: Briefcase,
      permission: "manage_content",
    },
    {
      title: "Paquetes",
      href: "/dashboard/packages",
      icon: Package,
      permission: "manage_content",
    },
    {
      title: "Caracteristicas",
      href: "/dashboard/features",
      icon: Settings,
      permission: "manage_content", // Todos pueden ver
    },
  ]

  // Filtrar elementos de navegación según permisos
  const filteredNavItems = navItems.filter(
    (item) => !item.permission || session?.user.permissions.includes(item.permission),
  )

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:relative md:min-h-screen">
      <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <span className="text-xl font-bold text-gray-900">Kothler Admin</span>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-gray-500",
                    )}
                  />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <Link
            href="/api/auth/signout"
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400" />
            Cerrar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

