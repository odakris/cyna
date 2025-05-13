"use client"

import { useState } from "react"
import ProductsHeader from "@/components/Admin/Products/ProductsHeader"
import ProductsStats from "@/components/Admin/Products/ProductsStats"
import ProductsFilters from "@/components/Admin/Products/ProductsFilters"
import ProductsTable from "@/components/Admin/Products/ProductsTable"
import DeleteDialog from "@/components/Admin/Products/DeleteDialog"
import { useProductsData } from "@/hooks/product/use-products-data"
import { useProductsTable } from "@/hooks/product/use-products-table"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { ProductsHomeSkeleton } from "@/components/Skeletons/ProductSkeletons"
import { AlertTriangle } from "lucide-react"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { useCategories } from "@/hooks/category/use-categories"

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

  const { categories } = useCategories()

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
      // console.error("Erreur handleDelete:", error)
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
    <div className="container mx-auto p-0 sm:p-3 md:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
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
        <CardContent className="p-3 sm:p-6">
          {/* Filtres et options de recherche */}
          <ProductsFilters
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            stockOptions={stockOptions}
            fetchProducts={fetchProducts}
            categories={categories}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            stats={stats}
          />

          {/* Tableau des produits */}
          <ProductsTable table={table} />
        </CardContent>

        <CardFooter className="bg-muted/50 py-3 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground text-center sm:text-left mb-2 sm:mb-0">
            Total: <strong>{products.length}</strong> | Disponibles:{" "}
            <strong className="text-green-600">{stats.available}</strong> |
            Stock faible:{" "}
            <strong className="text-amber-600">{stats.lowStock}</strong>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
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
