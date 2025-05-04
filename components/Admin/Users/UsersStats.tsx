import { Card, CardContent } from "@/components/ui/card"
import { Users, CheckCheck, XCircle, Shield } from "lucide-react"

interface UsersStatsProps {
  stats: {
    total: number
    verified: number
    unverified: number
    adminCount: number
  }
}

export default function UsersStats({ stats }: UsersStatsProps) {
  return (
    <>
      {/* Version desktop - inchangée */}
      <div className="hidden md:grid md:grid-cols-1 md:sm:grid-cols-2 md:md:grid-cols-4 md:gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Utilisateurs
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Emails Vérifiés
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.verified}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Emails Non Vérifiés
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {stats.unverified}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Administrateurs
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.adminCount}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Version mobile - nouvelle */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Utilisateurs
              </p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <Users className="h-6 w-6 text-primary opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Emails Vérifiés
              </p>
              <p className="text-xl font-bold text-green-600">
                {stats.verified}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCheck className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Emails Non Vérifiés
              </p>
              <p className="text-xl font-bold text-amber-600">
                {stats.unverified}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Administrateurs
              </p>
              <p className="text-xl font-bold text-blue-600">
                {stats.adminCount}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
