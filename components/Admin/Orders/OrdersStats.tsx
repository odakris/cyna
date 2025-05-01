import { Card, CardContent } from "@/components/ui/card"
import { ReceiptText, Loader2, TruckIcon, BanknoteIcon } from "lucide-react"

interface OrdersStatsProps {
  stats: {
    total: number
    pending: number
    completed: number
    totalRevenue: number
  }
}

export default function OrdersStats({ stats }: OrdersStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
  )
}
