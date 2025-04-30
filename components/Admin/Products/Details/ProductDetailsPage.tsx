"use client"

import { useProductDetails } from "@/hooks/use-product-details"
import { ProductDetailSkeleton } from "@/components/Skeletons/ProductSkeletons"
import ProductHeader from "@/components/Admin/Products/Details/ProductHeader"
import ProductInfo from "@/components/Admin/Products/Details/ProductInfo"
import ProductSpecs from "@/components/Admin/Products/Details/ProductSpecs"
import ProductGallery from "@/components/Admin/Products/Details/ProductGallery"
import ProductSidebar from "@/components/Admin/Products/Details/ProductSidebar"
import ErrorDisplay from "@/components/Admin/Products/Details/ErrorDisplay"
import DeleteDialog from "@/components/Admin/Products/Details/DeleteDialog"

interface ProductDetailsPageProps {
  id: string
}

export function ProductDetailsPage({ id }: ProductDetailsPageProps) {
  const {
    product,
    category,
    loading,
    errorMessage,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEdit,
    handleDelete,
    formatDate,
    formatPrice,
  } = useProductDetails(id)

  if (loading) {
    return <ProductDetailSkeleton />
  }

  if (errorMessage || !product) {
    return <ErrorDisplay errorMessage={errorMessage} />
  }

  return (
    <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      {/* En-tête avec titre et actions */}
      <ProductHeader
        product={product}
        category={category}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        handleEdit={handleEdit}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale avec les détails */}
        <div className="lg:col-span-2">
          {/* Informations générales du produit */}
          <ProductInfo product={product} formatPrice={formatPrice} />

          {/* Spécifications techniques */}
          <ProductSpecs product={product} handleEdit={handleEdit} />

          {/* Galerie d'images */}
          <ProductGallery product={product} handleEdit={handleEdit} />
        </div>

        {/* Colonne d'informations (sidebar) */}
        <ProductSidebar
          product={product}
          category={category}
          formatDate={formatDate}
        />
      </div>

      {/* Dialog de confirmation de suppression */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        productName={product.name}
        onConfirm={handleDelete}
      />
    </div>
  )
}
