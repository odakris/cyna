import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderWithItems } from "@/types/Types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ArrowLeft, Download, Loader2 } from "lucide-react"
import { JSX } from "react"
import PermissionGuard from "@/components/Auth/PermissionGuard"

interface OrderDetailHeaderProps {
  order: OrderWithItems
  formattedDate: string
  updating: boolean
  updateStatus: string | null
  setUpdateStatus: (status: string | null) => void
  handleUpdateStatus: () => void
  orderStatusConfig: Record<
    string,
    { bgColor: string; color: string; icon: JSX.Element; label: string }
  >
}

export default function OrderDetailHeader({
  order,
  formattedDate,
  updating,
  updateStatus,
  setUpdateStatus,
  handleUpdateStatus,
  orderStatusConfig,
}: OrderDetailHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">
            Commande #{order.id_order}
          </h1>
          <Badge
            className={`ml-2 ${orderStatusConfig[order.order_status]?.bgColor} ${orderStatusConfig[order.order_status]?.color} text-xs`}
          >
            {orderStatusConfig[order.order_status]?.icon}
            <span className="ml-1">
              {orderStatusConfig[order.order_status]?.label ||
                order.order_status}
            </span>
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground ml-10">
          Passée le {formattedDate}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
        <PermissionGuard permission="orders:edit">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={updateStatus || order.order_status}
              onValueChange={setUpdateStatus}
            >
              <SelectTrigger className="h-9 w-full sm:w-[180px] text-xs sm:text-sm">
                <SelectValue placeholder="Changer le statut" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(orderStatusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {config.icon}
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleUpdateStatus}
              disabled={
                !updateStatus || updateStatus === order.order_status || updating
              }
              variant={"cyna"}
              className="h-9 text-xs sm:text-sm"
            >
              {updating && (
                <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              )}
              Mettre à jour
            </Button>
          </div>
        </PermissionGuard>

        {order.invoice_pdf_url && (
          <Button
            variant="outline"
            asChild
            className="h-9 text-xs sm:text-sm w-full sm:w-auto"
          >
            <a
              href={order.invoice_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Télécharger</span>
              <span className="hidden sm:inline"> la facture</span>
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
