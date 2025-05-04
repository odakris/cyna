import { Card, CardContent } from "@/components/ui/card"
import { ReceiptText, Loader2, TruckIcon, BanknoteIcon } from "lucide-react"

interface OrdersStatsProps {
  stats: {
    total: number
    pending: number
    processing: number
    completed: number
    today: number
    totalRevenue: number
  }
}

export default function OrdersStats({ stats }: OrdersStatsProps) {
  return (
    <>
      {/* Version desktop - inchangée */}
      <div className="hidden md:grid md:grid-cols-1 md:sm:grid-cols-2 md:md:grid-cols-4 md:gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Commandes
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <ReceiptText className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                En attente
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Terminées
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.completed}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <TruckIcon className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Chiffre d&apos;affaires
              </p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(stats.totalRevenue)}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <BanknoteIcon className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Version mobile - nouvelle version */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Commandes
              </p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <ReceiptText className="h-6 w-6 text-primary opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                En attente
              </p>
              <p className="text-xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Terminées
              </p>
              <p className="text-xl font-bold text-blue-600">
                {stats.completed}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
              <TruckIcon className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">CA</p>
              <p className="text-xl font-bold text-green-600">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(stats.totalRevenue)}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <BanknoteIcon className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
