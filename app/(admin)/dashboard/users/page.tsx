"use client"

import { useState } from "react"
import { useUsersData } from "@/hooks/use-users-data"
import { useUsersTable } from "@/hooks/use-users-table"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UsersHomeSkeleton } from "@/components/Skeletons/UserSkeletons"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import UsersHeader from "@/components/Admin/Users/UsersHeader"
import UsersStats from "@/components/Admin/Users/UsersStats"
import UsersFilters from "@/components/Admin/Users/UsersFilters"
import UsersTable from "@/components/Admin/Users/UsersTable"
import DeleteDialog from "@/components/Admin/Users/DeleteDialog"

export default function UserHomePage() {
  // État et logique des données
  const {
    users,
    loading,
    error,
    fetchUsers,
    deleteUsers,
    setActiveTab,
    activeTab,
    stats,
    setError,
  } = useUsersData()

  // État et logique de la table de données
  const { table, globalFilter, setGlobalFilter } = useUsersTable(
    users,
    activeTab
  )

  // État du dialog de suppression
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Gestionnaire de suppression
  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => row.original.id_user)

    if (selectedIds.length === 0) return

    try {
      const result = await deleteUsers(selectedIds)

      if (!result.success) {
        setError(result.message || "Erreur lors de la suppression")
      }

      setShowDeleteDialog(false)
      table.resetRowSelection()
    } catch (error) {
      console.error("Erreur handleDelete:", error)
      setError(
        "Une erreur est survenue lors de la suppression des utilisateurs."
      )
    }
  }

  if (loading) {
    return <UsersHomeSkeleton />
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={fetchUsers} className="w-full sm:w-auto">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission d'accéder à cette page." />
      }
    >
      <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
        {/* En-tête avec titre et actions */}
        <UsersHeader
          usersCount={users.length}
          selectedCount={table.getFilteredSelectedRowModel().rows.length}
          setShowDeleteDialog={setShowDeleteDialog}
        />

        {/* Statistiques des utilisateurs */}
        <UsersStats stats={stats} />

        {/* Filtres et tableau */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full mt-3"
            >
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="tous" className="flex-1 sm:flex-initial">
                  Tous
                  <Badge variant="secondary" className="ml-2">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="verifies"
                  className="flex-1 sm:flex-initial"
                >
                  Vérifiés
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-800"
                  >
                    {stats.verified}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="non-verifies"
                  className="flex-1 sm:flex-initial"
                >
                  Non vérifiés
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-amber-100 text-amber-800"
                  >
                    {stats.unverified}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 ml-auto"
                  onClick={() => setError(null)}
                >
                  Fermer
                </Button>
              </Alert>
            )}

            {/* Filtres et options de recherche */}
            <UsersFilters
              table={table}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              fetchUsers={fetchUsers}
            />

            {/* Tableau des utilisateurs */}
            <UsersTable table={table} />
          </CardContent>

          <CardFooter className="bg-muted/50 py-3 border-t flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Total des utilisateurs: <strong>{stats.total}</strong> | Vérifiés:{" "}
              <strong className="text-green-600">{stats.verified}</strong> |
              Administrateurs:{" "}
              <strong className="text-blue-600">{stats.adminCount}</strong>
            </p>
            <Button variant="outline" size="sm" onClick={fetchUsers}>
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
