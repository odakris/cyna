"use client"

import { useHeroCarouselDetails } from "@/hooks/hero-carousel/use-hero-carousel-details"
import { HeroCarouselDetailSkeleton } from "@/components/Skeletons/HeroCarouselSkeletons"
import HeroCarouselHeader from "@/components/Admin/HeroCarousel/Details/HeroCarouselHeader"
import SlidePreview from "@/components/Admin/HeroCarousel/Details/SlidePreview"
import SlideActions from "@/components/Admin/HeroCarousel/Details/SlideActions"
import DeleteDialog from "@/components/Admin/HeroCarousel/Details/DeleteDialog"
import ErrorDisplay from "@/components/Admin/HeroCarousel/Details/ErrorDisplay"

interface HeroCarouselDetailPageProps {
  id: string
}

export default function HeroCarouselDetailPage({
  id,
}: HeroCarouselDetailPageProps) {
  const {
    slide,
    loading,
    errorMessage,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEdit,
    handleDelete,
    handleToggleActive,
    formatDate,
  } = useHeroCarouselDetails(id)

  if (loading) {
    return <HeroCarouselDetailSkeleton />
  }

  if (errorMessage || !slide) {
    return <ErrorDisplay errorMessage={errorMessage} />
  }

  return (
    <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      {/* Header with title and actions */}
      <HeroCarouselHeader
        slide={slide}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        handleEdit={handleEdit}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column with details */}
        <div className="lg:col-span-2">
          <SlidePreview slide={slide} handleEdit={handleEdit} />
        </div>

        {/* Sidebar column */}
        <div className="lg:col-span-1">
          <SlideActions
            slide={slide}
            formatDate={formatDate}
            onStatusChange={handleToggleActive}
            onEdit={handleEdit}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        slideName={slide.title}
        onConfirm={handleDelete}
      />
    </div>
  )
}
