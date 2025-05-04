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
import { RefreshCw } from "lucide-react"
import { HeroCarouselListSkeleton } from "@/components/Skeletons/HeroCarouselSkeletons"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
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
    <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
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
              <TabsTrigger value="actifs" className="flex-1 sm:flex-initial">
                Actifs
                <Badge
                  variant="secondary"
                  className="ml-2 bg-green-100 text-green-800"
                >
                  {stats.active}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="inactifs" className="flex-1 sm:flex-initial">
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
        </CardHeader>
        <CardContent className="p-6">
          {/* Search and filter options */}
          <HeroCarouselFilters
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            fetchSlides={fetchSlides}
          />

          {/* Hero carousel slides table */}
          <HeroCarouselTable table={table} />
        </CardContent>

        <CardFooter className="bg-muted/50 py-3 border-t flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Total des slides: <strong>{stats.total}</strong> | Actifs:{" "}
            <strong className="text-green-600">{stats.active}</strong> |
            Inactifs:{" "}
            <strong className="text-gray-500">{stats.inactive}</strong>
          </p>
          <Button variant="outline" size="sm" onClick={fetchSlides}>
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
