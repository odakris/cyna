"use client"

import { useState } from "react"
import HeroCarouselHeader from "@/components/Admin/HeroCarousel/HeroCarouselHeader"
import HeroCarouselStats from "@/components/Admin/HeroCarousel/HeroCarouselStats"
import HeroCarouselFilters from "@/components/Admin/HeroCarousel/HeroCarouselFilters"
import HeroCarouselTable from "@/components/Admin/HeroCarousel/HeroCarouselTable"
import DeleteDialog from "@/components/Admin/HeroCarousel/DeleteDialog"
import { useHeroCarouselData } from "@/hooks/hero-carousel/use-hero-carousel-data"
import { useHeroCarouselTable } from "@/hooks/hero-carousel/use-hero-carousel-table"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { HeroCarouselListSkeleton } from "@/components/Skeletons/HeroCarouselSkeletons"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CardTitle, CardDescription } from "@/components/ui/card"

export default function HeroCarouselPage() {
  // State and logic for data
  const {
    slides,
    loading,
    error,
    fetchSlides,
    deleteSlides,
    setActiveTab,
    activeTab,
    stats,
  } = useHeroCarouselData()

  // State and logic for data table
  const { table, globalFilter, setGlobalFilter } = useHeroCarouselTable(
    slides,
    activeTab
  )

  // State for delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Delete handler
  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => row.original.id_hero_slide)

    if (selectedIds.length === 0) return

    try {
      await deleteSlides(selectedIds)
      setShowDeleteDialog(false)
      table.resetRowSelection()
    } catch (error) {
      console.error("Erreur handleDelete:", error)
    }
  }

  if (loading) {
    return <HeroCarouselListSkeleton />
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
          <Button onClick={fetchSlides}>Réessayer</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header with title and actions */}
      <HeroCarouselHeader
        slidesCount={slides.length}
        selectedCount={table.getFilteredSelectedRowModel().rows.length}
        setShowDeleteDialog={setShowDeleteDialog}
      />

      {/* Statistics */}
      <HeroCarouselStats stats={stats} />

      {/* Filters and table */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-0 sm:pb-3">
          {/* Version desktop des onglets - visible uniquement sur desktop */}
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
                    {stats?.total || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="actifs" className="flex-1 sm:flex-initial">
                  Actifs
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-800"
                  >
                    {stats?.active || 0}
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
                    {stats?.inactive || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 ml-auto"
                onClick={() => fetchSlides()}
              >
                Réessayer
              </Button>
            </Alert>
          )}

          {/* Search and filter options - ne passe que le filtre actif/inactif à HeroCarouselFilters */}
          <HeroCarouselFilters
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            fetchSlides={fetchSlides}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            stats={stats}
          />

          {/* Hero carousel slides table */}
          <HeroCarouselTable table={table} />
        </CardContent>

        <CardFooter className="bg-muted/50 py-3 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground text-center sm:text-left mb-2 sm:mb-0">
            Total: <strong>{stats?.total || 0}</strong> | Actifs:{" "}
            <strong className="text-green-600">{stats?.active || 0}</strong> |
            Inactifs:{" "}
            <strong className="text-gray-500">{stats?.inactive || 0}</strong>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSlides}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Actualiser
          </Button>
        </CardFooter>
      </Card>

      {/* Delete confirmation dialog */}
      <DeleteDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        selectedCount={Object.keys(table.getState().rowSelection).length}
        onConfirm={handleDelete}
      />
    </div>
  )
}
