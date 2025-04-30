"use client"

import { useState } from "react"
import ProductsHeader from "@/components/Admin/Products/ProductsHeader"
import ProductsStats from "@/components/Admin/Products/ProductsStats"
import ProductsFilters from "@/components/Admin/Products/ProductsFilters"
import ProductsTable from "@/components/Admin/Products/ProductsTable"
import DeleteDialog from "@/components/Admin/Products/DeleteDialog"
import { useProductsData } from "@/hooks/use-products-data"
import { useProductsTable } from "@/hooks/use-products-table"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { ProductsHomeSkeleton } from "@/components/Skeletons/ProductSkeletons"

export default function ProductsPage() {
  // État et logique des données
  const {
    products,
    loading,
    error,
    fetchProducts,
    deleteProducts,
    setActiveTab,
    activeTab,
    stats,
  } = useProductsData()

  // État et logique de la table de données
  const { table, globalFilter, setGlobalFilter, stockOptions } =
    useProductsTable(products, activeTab)

  // État du dialog de suppression
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Gestionnaire de suppression
  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => row.original.id_product)

    if (selectedIds.length === 0) return

    try {
      await deleteProducts(selectedIds)
      setShowDeleteDialog(false)
      table.resetRowSelection()
    } catch (error) {
      console.error("Erreur handleDelete:", error)
    }
  }

  if (loading) {
    return <ProductsHomeSkeleton />
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
          <Button onClick={fetchProducts}>Réessayer</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
      {/* En-tête avec titre et actions */}
      <ProductsHeader
        productsCount={products.length}
        selectedCount={table.getFilteredSelectedRowModel().rows.length}
        setShowDeleteDialog={setShowDeleteDialog}
      />

      {/* Statistiques des produits */}
      <ProductsStats stats={stats} />

      {/* Filtres et tableau */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
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
                value="disponibles"
                className="flex-1 sm:flex-initial"
              >
                Disponibles
                <Badge
                  variant="secondary"
                  className="ml-2 bg-green-100 text-green-800"
                >
                  {stats.available}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="indisponibles"
                className="flex-1 sm:flex-initial"
              >
                Indisponibles
                <Badge
                  variant="secondary"
                  className="ml-2 bg-gray-100 text-gray-800"
                >
                  {stats.unavailable}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-6">
          {/* Filtres et options de recherche */}
          <ProductsFilters
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            stockOptions={stockOptions}
            fetchProducts={fetchProducts}
          />

          {/* Tableau des produits */}
          <ProductsTable table={table} />
        </CardContent>

        <CardFooter className="bg-muted/50 py-3 border-t flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Total des produits: <strong>{products.length}</strong> |
            Disponibles:{" "}
            <strong className="text-green-600">{stats.available}</strong> |
            Stock faible:{" "}
            <strong className="text-amber-600">{stats.lowStock}</strong>
          </p>
          <Button variant="outline" size="sm" onClick={fetchProducts}>
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

// Composant Badge à portée locale
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { CardTitle, CardDescription } from "@/components/ui/card"
