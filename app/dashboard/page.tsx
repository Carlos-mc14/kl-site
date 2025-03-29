import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCircle, Users, Shield } from "lucide-react"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/user"
import Profile from "@/lib/models/profile"
import Role from "@/lib/models/role"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  await dbConnect()

  // Obtener estadísticas
  const usersCount = await User.countDocuments({})
  const profilesCount = await Profile.countDocuments({})
  const publicProfilesCount = await Profile.countDocuments({ isPublic: true })
  const rolesCount = await Role.countDocuments({})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {session.user.name}. Gestiona los perfiles, usuarios y roles del sistema.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="analytics">Actividad</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Perfiles</CardTitle>
                <UserCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profilesCount}</div>
                <p className="text-xs text-muted-foreground">{publicProfilesCount} perfiles públicos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usersCount}</div>
                <p className="text-xs text-muted-foreground">Usuarios registrados en el sistema</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Roles</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rolesCount}</div>
                <p className="text-xs text-muted-foreground">Roles configurados en el sistema</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Información general</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-medium">Perfiles</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gestiona los perfiles de los miembros del equipo que se mostrarán en la página pública.
                    </p>
                  </div>
                  <div className="border-b pb-4">
                    <h3 className="font-medium">Usuarios</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Administra los usuarios que pueden acceder al sistema y sus permisos.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Roles</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configura los roles y permisos para controlar el acceso a las funcionalidades.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Tu perfil</CardTitle>
                <CardDescription>Información de tu cuenta y permisos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Nombre</p>
                    <p className="text-sm text-muted-foreground">{session.user.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Rol</p>
                    <p className="text-sm text-muted-foreground capitalize">{session.user.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
              <CardDescription>Historial de actividades en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                El registro de actividades estará disponible próximamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

