"use client"

import { useState } from "react"
import { useMainMessagesData } from "@/hooks/main-message/use-main-messages-data"
import { useMainMessagesTable } from "@/hooks/main-message/use-main-messages-table"
import { mainMessageColumns } from "./MainMessageColumns"
import MainMessageHeader from "./MainMessageHeader"
import MainMessageStats from "./MainMessageStats"
import MainMessageFilters from "./MainMessageFilters"
import MainMessageTable from "./MainMessageTable"
import MainMessageDeleteDialog from "./MainMessageDeleteDialog"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { Role } from "@prisma/client"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"

export default function MainMessageDashboardPage() {
  // État et logique des données
  const {
    messages,
    loading,
    error,
    fetchMessages,
    deleteMessages,
    toggleMessageActive,
    setActiveTab,
    activeTab,
    stats,
  } = useMainMessagesData()

  // État et logique de la table de données
  const { table, globalFilter, setGlobalFilter } = useMainMessagesTable(
    messages,
    activeTab,
    mainMessageColumns,
    toggleMessageActive
  )

  // État du dialog de suppression
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Gestionnaire de suppression
  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => row.original.id_main_message)

    if (selectedIds.length === 0) return

    try {
      await deleteMessages(selectedIds)
      setShowDeleteDialog(false)
      table.resetRowSelection()
    } catch (error) {
      console.error("Erreur handleDelete:", error)
    }
  }

  if (loading) {
    return <MainMessageListSkeleton />
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
          <Button onClick={fetchMessages}>Réessayer</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de gérer les messages." />
      }
    >
      <div className="container mx-auto p-0 sm:p-3 md:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
        {/* En-tête avec titre et actions */}
        <MainMessageHeader
          messagesCount={messages.length}
          selectedCount={table.getFilteredSelectedRowModel().rows.length}
          setShowDeleteDialog={setShowDeleteDialog}
        />

        {/* Statistiques des messages */}
        <MainMessageStats stats={stats} />

        {/* Filtres et tableau */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-0 sm:pb-3">
            {/* Version desktop des onglets - inchangée */}
            <div className="hidden md:block">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="tous" className="flex-1 sm:flex-initial">
                    Tous
                    <Badge variant="secondary" className="ml-2">
                      {stats.total}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="actifs"
                    className="flex-1 sm:flex-initial"
                  >
                    Actifs
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-green-100 text-green-800"
                    >
                      {stats.active}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="inactifs"
                    className="flex-1 sm:flex-initial"
                  >
                    Inactifs
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-gray-100 text-gray-800"
                    >
                      {stats.inactive}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-6">
            {/* Filtres et options de recherche */}
            <MainMessageFilters
              table={table}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              fetchMessages={fetchMessages}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              stats={stats}
            />

            {/* Tableau des messages */}
            <MainMessageTable table={table} />
          </CardContent>

          <CardFooter className="bg-muted/50 py-3 border-t flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground text-center sm:text-left mb-2 sm:mb-0">
              Total: <strong>{stats.total}</strong> | Actifs:{" "}
              <strong className="text-green-600">{stats.active}</strong> |
              Inactifs:{" "}
              <strong className="text-gray-500">{stats.inactive}</strong>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMessages}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Actualiser
            </Button>
          </CardFooter>
        </Card>

        {/* Dialog de confirmation de suppression */}
        <MainMessageDeleteDialog
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
          selectedCount={Object.keys(table.getState().rowSelection).length}
          onConfirm={handleDelete}
        />
      </div>
    </RoleGuard>
  )
}

// Composant de fallback pendant le chargement
const MainMessageListSkeleton = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Stats Placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-200 rounded h-24 animate-pulse" />
        ))}
      </div>

      {/* Card Placeholder */}
      <div className="bg-gray-200 rounded h-96 animate-pulse" />
    </div>
  )
}
