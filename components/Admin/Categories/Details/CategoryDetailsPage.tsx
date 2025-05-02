"use client"

import { CategoryDetailsSkeleton } from "@/components/Skeletons/CategorySkeletons"
import ErrorDisplay from "@/components/Admin/Categories/Details/ErrorDisplay"
import CategoryHeader from "@/components/Admin/Categories/Details/CategoryHeader"
import DeleteDialog from "@/components/Admin/Categories/Details/DeleteDialog"
import { useCategoryDetails } from "@/hooks/category/use-category-details"
import Image from "next/image"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ImageIcon,
  Tag,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import CategoryActiveSwitch from "@/components/Admin/Categories/CategoryActiveSwitch"

interface CategoryDetailsPageProps {
  id: string
}

export function CategoryDetailsPage({ id }: CategoryDetailsPageProps) {
  const {
    category,
    loading,
    errorMessage,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    productCount,
    handleEdit,
    handleDelete,
    handleStatusChange,
  } = useCategoryDetails(id)

  if (loading) {
    return <CategoryDetailsSkeleton />
  }

  if (errorMessage || !category) {
    return <ErrorDisplay errorMessage={errorMessage} />
  }

  return (
    <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      {/* En-tête avec titre et actions */}
      <CategoryHeader
        category={category}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        handleEdit={handleEdit}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale avec les détails */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Aperçu de la catégorie
              </CardTitle>
              <CardDescription>
                Image et description détaillée de la catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted border">
                <Image
                  width={500}
                  height={300}
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {category.description ||
                    "Aucune description disponible pour cette catégorie."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne d'informations */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Informations
              </CardTitle>
              <CardDescription>
                Détails techniques de la catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                <p className="font-semibold">{category.name}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Priorité d&apos;affichage
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{category.priority_order}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {category.priority_order === 1
                      ? "(Priorité maximale)"
                      : category.priority_order < 5
                        ? "(Haute priorité)"
                        : "(Priorité standard)"}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Produits associés
                </p>
                <div className="flex items-center gap-2">
                  <Badge>{productCount}</Badge>
                  <span className="text-sm text-muted-foreground">
                    produit{productCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">
                    Statut de la catégorie
                  </p>
                  {category.active ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Actif
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-slate-100 text-slate-800 border-slate-200"
                    >
                      <XCircle className="mr-1 h-3 w-3" /> Inactif
                    </Badge>
                  )}
                </div>
                <CategoryActiveSwitch
                  categoryId={category.id_category}
                  initialActive={category.active}
                  onStatusChange={handleStatusChange}
                />
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Dernière mise à jour
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(category.updated_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        categoryName={category.name}
        productCount={productCount}
        onConfirm={handleDelete}
      />
    </div>
  )
}
