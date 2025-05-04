"use client"

import { useState } from "react"
import CategoriesHeader from "@/components/Admin/Categories/CategoriesHeader"
import CategoriesStats from "@/components/Admin/Categories/CategoriesStats"
import CategoriesFilters from "@/components/Admin/Categories/CategoriesFilters"
import CategoriesTable from "@/components/Admin/Categories/CategoriesTable"
import DeleteDialog from "@/components/Admin/Categories/DeleteDialog"
import { useCategoriesData } from "@/hooks/category/use-categories-data"
import { useCategoriesTable } from "@/hooks/category/use-categories-table"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CategoryListSkeleton } from "@/components/Skeletons/CategorySkeletons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CategoryPage() {
  // État et logique des données
  const {
    categories,
    loading,
    error,
    setError,
    fetchCategories,
    deleteCategories,
    setActiveTab,
    activeTab,
    stats,
  } = useCategoriesData()

  // État et logique de la table de données
  const { table, globalFilter, setGlobalFilter } = useCategoriesTable(
    categories,
    activeTab
  )

  // État du dialog de suppression
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Gestionnaire de suppression
  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => row.original.id_category)

    if (selectedIds.length === 0) return

    try {
      const result = await deleteCategories(selectedIds)
      if (!result.success) {
        setError(result.message || "Erreur lors de la suppression")
      }
      setShowDeleteDialog(false)
      table.resetRowSelection()
    } catch (error) {
      console.error("Erreur handleDelete:", error)
      setError("Erreur lors de la suppression des catégories")
    }
  }

  if (loading) {
    return <CategoryListSkeleton />
  }

  if (error && !categories.length) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={fetchCategories} className="w-full sm:w-auto">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-0 sm:p-3 md:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* En-tête avec titre et actions */}
      <CategoriesHeader
        categoriesCount={categories.length}
        selectedCount={table.getFilteredSelectedRowModel().rows.length}
        setShowDeleteDialog={setShowDeleteDialog}
      />

      {/* Statistiques des catégories */}
      <CategoriesStats stats={stats} />

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
                <TabsTrigger value="toutes" className="flex-1 sm:flex-initial">
                  Toutes
                  <Badge variant="secondary" className="ml-2">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="avec-produits"
                  className="flex-1 sm:flex-initial"
                >
                  Avec produits
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-800"
                  >
                    {stats.withProducts}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="sans-produits"
                  className="flex-1 sm:flex-initial"
                >
                  Sans produits
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-gray-100 text-gray-800"
                  >
                    {stats.withoutProducts}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-6">
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
          <CategoriesFilters
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            fetchCategories={fetchCategories}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            stats={stats}
          />

          {/* Tableau des catégories */}
          <CategoriesTable table={table} />
        </CardContent>

        <CardFooter className="bg-muted/50 py-3 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground text-center sm:text-left mb-2 sm:mb-0">
            Total: <strong>{stats.total}</strong> | Avec produits:{" "}
            <strong className="text-green-600">{stats.withProducts}</strong> |
            Priorité haute:{" "}
            <strong className="text-blue-600">{stats.highPriority}</strong>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCategories}
            className="w-full sm:w-auto"
          >
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
  )
}
