"use client"

import * as React from "react"
import { useState } from "react"
import { Role } from "@prisma/client"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { CardTitle, CardDescription } from "@/components/ui/card"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { OrdersHomeSkeleton } from "@/components/Skeletons/OrderSkeletons"
import { useOrdersData } from "@/hooks/order/use-orders-data"
import { useOrdersTable } from "@/hooks/order/use-orders-table"
import OrdersHeader from "@/components/Admin/Orders/OrdersHeader"
import OrdersStats from "@/components/Admin/Orders/OrdersStats"
import OrdersFilters from "@/components/Admin/Orders/OrdersFilters"
import OrdersTable from "@/components/Admin/Orders/OrdersTable"
import DeleteDialog from "@/components/Admin/Orders/DeleteDialog"

export default function OrderHomePage() {
  // État et logique des données
  const {
    orders,
    loading,
    error,
    fetchOrders,
    deleteOrders,
    setActiveTab,
    activeTab,
    stats,
  } = useOrdersData()

  // État et logique de la table de données
  const { table, globalFilter, setGlobalFilter, dateOptions } = useOrdersTable(
    orders,
    activeTab
  )

  // État du dialogue de suppression
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Gestionnaire de suppression
  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => row.original.id_order)

    if (selectedIds.length === 0) return

    try {
      await deleteOrders(selectedIds)
      setShowDeleteDialog(false)
      table.resetRowSelection()
    } catch (error) {
      console.error("Erreur handleDelete:", error)
    }
  }

  if (loading) {
    return <OrdersHomeSkeleton />
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-lg mt-8 border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Erreur</CardTitle>
          </div>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={fetchOrders}>Réessayer</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de créer un message." />
      }
    >
      <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
        {/* En-tête avec titre et actions */}
        <OrdersHeader
          ordersCount={orders.length}
          selectedCount={table.getFilteredSelectedRowModel().rows.length}
          setShowDeleteDialog={setShowDeleteDialog}
        />

        {/* Statistiques des commandes */}
        <OrdersStats stats={stats} />

        {/* Filtres et tableau */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all" className="flex-1 sm:flex-initial">
                  Toutes
                  <Badge variant="secondary" className="ml-2">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="PENDING" className="flex-1 sm:flex-initial">
                  En attente
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-yellow-100 text-yellow-800"
                  >
                    {stats.pending}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="PROCESSING"
                  className="flex-1 sm:flex-initial"
                >
                  En cours
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-blue-100 text-blue-800"
                  >
                    {stats.processing}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="COMPLETED"
                  className="flex-1 sm:flex-initial"
                >
                  Terminé
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-800"
                  >
                    {stats.completed}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="p-6">
            {/* Filtres et options de recherche */}
            <OrdersFilters
              table={table}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              dateOptions={dateOptions}
              fetchOrders={fetchOrders}
            />

            {/* Tableau des commandes */}
            <OrdersTable table={table} />
          </CardContent>

          <CardFooter className="bg-muted/50 py-3 border-t flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Total des commandes: <strong>{stats.total}</strong> | En attente:{" "}
              <strong className="text-yellow-600">{stats.pending}</strong> |
              Aujourd&apos;hui:{" "}
              <strong className="text-blue-600">{stats.today}</strong> | CA:{" "}
              <strong className="text-green-600">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(stats.totalRevenue)}
              </strong>
            </p>
            <Button variant="outline" size="sm" onClick={fetchOrders}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Actualiser
            </Button>
          </CardFooter>
        </Card>

        {/* Dialog de confirmation de suppression */}
        <DeleteDialog
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
          selectedCount={Object.keys(table.getState().rowSelection).length}
          onConfirm={handleDelete}
        />
      </div>
    </RoleGuard>
  )
}
