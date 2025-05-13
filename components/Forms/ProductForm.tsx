"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { ImageUploader } from "@/components/Forms/ImageUploader"
import {
  productFormSchema,
  ProductFormValues,
} from "@/lib/validations/product-schema"
import {
  Save,
  ImageIcon,
  BookText,
  Info,
  Tag,
  Pencil,
  FileImage,
  ArrowLeft,
  ArrowRight,
  FileQuestion,
  Package,
  ListChecks,
  Layers,
  CheckCircle2,
  XCircle,
  Banknote,
  BarChart3,
  Box,
  PencilLine,
  Power,
  AlertCircle,
} from "lucide-react"
import { Category } from "@prisma/client"

interface ProductFormProps {
  categories: Category[]
  initialData?: ProductFormValues
  isEditing?: boolean
  productId?: number
}

export function ProductForm({
  categories,
  initialData,
  isEditing = false,
  productId,
}: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState("basic")

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      technical_specs: initialData?.technical_specs || "",
      unit_price: initialData?.unit_price || 0,
      stock: initialData?.stock || 0,
      id_category: initialData?.id_category || 0,
      main_image: initialData?.main_image || "",
      priority_order: initialData?.priority_order || 1,
      available: initialData?.available ?? true,
      active: initialData?.active ?? true,
      product_caroussel_images: initialData?.product_caroussel_images || [],
    },
  })

  // Obtenir les valeurs actuelles pour la prévisualisation
  const watchedValues = form.watch()
  const formErrors = form.formState.errors

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true)

      // S'assurer que product_caroussel_images est bien un tableau
      const product_caroussel_images = Array.isArray(
        values.product_caroussel_images
      )
        ? values.product_caroussel_images.filter(
            img => img && img.trim() !== ""
          )
        : []

      // Formatage des valeurs avec gestion correcte des images du carrousel
      const formattedValues = {
        ...values,
        unit_price: Number(values.unit_price),
        stock: Number(values.stock),
        id_category: Number(values.id_category),
        priority_order: Number(values.priority_order),
        available: values.available,
        active: values.active,
        product_caroussel_images: product_caroussel_images,
      }

      console.log("formattedValues:", formattedValues)
      console.log(
        "Images du carrousel:",
        formattedValues.product_caroussel_images
      )

      let response

      if (isEditing && productId) {
        // Mise à jour d'un produit existant
        response = await fetch(`/api/products/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message || "Erreur lors de la mise à jour du produit"
          )
        }

        toast({
          variant: "success",
          description: "Le produit a été mis à jour avec succès.",
          title: "Produit mis à jour avec succès !",
        })

        // Redirection vers la page de détails du produit mis à jour
        router.push(`/dashboard/products/${productId}`)
      } else {
        // Création d'un nouveau produit
        response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message || "Erreur lors de la création du produit"
          )
        }

        // Récupérer l'ID du nouveau produit depuis la réponse
        const newProduct = await response.json()

        toast({
          variant: "success",
          description: "Le produit a été créé avec succès.",
          title: "Produit créé avec succès !",
        })

        // Redirection vers la page de détails du nouveau produit
        if (newProduct && newProduct.id_product) {
          router.push(`/dashboard/products/${newProduct.id_product}`)
        } else {
          // Fallback si l'ID n'est pas disponible
          router.push("/dashboard/products")
        }
      }
    } catch (error) {
      // console.error("Erreur onSubmit:", error)
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : `Erreur lors de la ${isEditing ? "mise à jour" : "création"} du produit.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Déterminer la catégorie sélectionnée pour l'aperçu
  const selectedCategory = categories.find(
    cat => cat.id_category === Number(watchedValues.id_category)
  )

  // Liste des erreurs à afficher
  const errorMessages = Object.entries(formErrors).map(([field, error]) => {
    const fieldLabels: { [key: string]: string } = {
      name: "Nom du produit",
      description: "Description commerciale",
      technical_specs: "Spécifications techniques",
      unit_price: "Prix unitaire",
      stock: "Stock disponible",
      id_category: "Catégorie",
      main_image: "Image principale",
      priority_order: "Priorité d'affichage",
      product_caroussel_images: "Images du carrousel",
    }

    return {
      field: fieldLabels[field] || field,
      message: error?.message || "Valeur invalide",
    }
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Alerte pour les erreurs de validation */}
      {errorMessages.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreurs dans le formulaire</AlertTitle>
          <AlertDescription>
            Veuillez corriger les erreurs suivantes :
            <ul className="list-disc pl-5 mt-2">
              {errorMessages.map((error, index) => (
                <li key={index}>
                  <strong>{error.field}</strong>: {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Colonne principale avec le formulaire */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs
                defaultValue="basic"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">
                      Informations de base
                    </span>
                    <span className="sm:hidden">Infos</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    <ListChecks className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Détails techniques</span>
                    <span className="sm:hidden">Détails</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="images"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    <FileImage className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Images</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4 sm:mt-6">
                  {/* Onglet des informations de base */}
                  <TabsContent value="basic" className="space-y-4 sm:space-y-6">
                    <Card>
                      <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <PencilLine className="h-4 w-4 sm:h-5 sm:w-5" />
                          Détails du Produit
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Informations principales du produit qui seront
                          visibles par les utilisateurs
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
                        <FormField
                          name="name"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">
                                Nom du produit
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Entrez le nom du produit..."
                                    {...field}
                                    disabled={isSubmitting}
                                    className="pl-9 text-sm sm:text-base h-9 sm:h-10"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs sm:text-sm">
                                Le nom complet qui sera affiché aux clients
                              </FormDescription>
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="description"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">
                                Description commerciale
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <BookText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Textarea
                                    placeholder="Décrivez ce produit..."
                                    {...field}
                                    disabled={isSubmitting}
                                    className="pl-9 pt-2 min-h-24 sm:min-h-32 text-sm sm:text-base"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs sm:text-sm">
                                Description attractive du produit pour les
                                clients
                              </FormDescription>
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <FormField
                            name="unit_price"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm sm:text-base">
                                  Prix unitaire (€)
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      {...field}
                                      disabled={isSubmitting}
                                      className="pl-9 text-sm sm:text-base h-9 sm:h-10"
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription className="text-xs sm:text-sm">
                                  Prix de vente en euros (TVA incluse)
                                </FormDescription>
                                <FormMessage className="text-xs sm:text-sm" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            name="id_category"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm sm:text-base">
                                  Catégorie
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Layers className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={
                                        field.value
                                          ? String(field.value)
                                          : undefined
                                      }
                                      disabled={isSubmitting}
                                    >
                                      <SelectTrigger className="pl-9 text-sm sm:text-base h-9 sm:h-10">
                                        <SelectValue placeholder="Sélectionner une catégorie" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map(category => (
                                          <SelectItem
                                            key={category.id_category}
                                            value={String(category.id_category)}
                                            className="text-sm sm:text-base"
                                          >
                                            {category.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </FormControl>
                                <FormDescription className="text-xs sm:text-sm">
                                  La catégorie sous laquelle le produit sera
                                  classé
                                </FormDescription>
                                <FormMessage className="text-xs sm:text-sm" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t px-3 sm:px-6">
                        <Button
                          type="button"
                          onClick={() => router.push("/dashboard/products")}
                          disabled={isSubmitting}
                          className="w-full sm:w-auto text-sm sm:text-base"
                        >
                          Annuler
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("details")}
                          className="gap-2 w-full sm:w-auto text-sm sm:text-base"
                          variant={"cyna"}
                        >
                          Suivant
                          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* Onglet des détails techniques */}
                  <TabsContent
                    value="details"
                    className="space-y-4 sm:space-y-6"
                  >
                    <Card>
                      <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <ListChecks className="h-4 w-4 sm:h-5 sm:w-5" />
                          Spécifications et disponibilité
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Détails techniques, stock et statut du produit
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
                        <FormField
                          name="technical_specs"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">
                                Spécifications techniques
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <ListChecks className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Textarea
                                    placeholder="Détaillez les spécifications techniques..."
                                    {...field}
                                    disabled={isSubmitting}
                                    className="pl-9 pt-2 min-h-24 sm:min-h-32 text-sm sm:text-base"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs sm:text-sm">
                                Caractéristiques techniques détaillées du
                                produit
                              </FormDescription>
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <FormField
                            name="stock"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm sm:text-base">
                                  Stock disponible
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Box className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1"
                                      placeholder="0"
                                      {...field}
                                      disabled={isSubmitting}
                                      className="pl-9 text-sm sm:text-base h-9 sm:h-10"
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription className="text-xs sm:text-sm">
                                  Nombre d&apos;unités disponibles en stock
                                </FormDescription>
                                <FormMessage className="text-xs sm:text-sm" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="priority_order"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm sm:text-base">
                                  Ordre de priorité
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <BarChart3 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Select
                                      onValueChange={value =>
                                        field.onChange(parseInt(value))
                                      }
                                      defaultValue={field.value.toString()}
                                      disabled={isSubmitting}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="pl-9 text-sm sm:text-base h-9 sm:h-10">
                                          <SelectValue placeholder="Sélectionnez la priorité" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem
                                          value="1"
                                          className="text-sm sm:text-base"
                                        >
                                          1 - Très haute priorité
                                        </SelectItem>
                                        <SelectItem
                                          value="2"
                                          className="text-sm sm:text-base"
                                        >
                                          2 - Haute priorité
                                        </SelectItem>
                                        <SelectItem
                                          value="3"
                                          className="text-sm sm:text-base"
                                        >
                                          3 - Priorité élevée
                                        </SelectItem>
                                        <SelectItem
                                          value="5"
                                          className="text-sm sm:text-base"
                                        >
                                          5 - Priorité moyenne
                                        </SelectItem>
                                        <SelectItem
                                          value="7"
                                          className="text-sm sm:text-base"
                                        >
                                          7 - Priorité normale
                                        </SelectItem>
                                        <SelectItem
                                          value="10"
                                          className="text-sm sm:text-base"
                                        >
                                          10 - Priorité basse
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </FormControl>
                                <FormDescription className="text-xs sm:text-sm">
                                  Les produits sont affichés par ordre croissant
                                  de priorité (1 sera affiché en premier)
                                </FormDescription>
                                <FormMessage className="text-xs sm:text-sm" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          name="available"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm sm:text-base">
                                  Disponibilité du produit
                                </FormLabel>
                                <FormDescription className="text-xs sm:text-sm">
                                  {field.value
                                    ? "Le produit est disponible à la vente"
                                    : "Le produit n'est pas disponible à la vente"}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="active"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4 mt-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm sm:text-base">
                                  Activation du produit
                                </FormLabel>
                                <FormDescription className="text-xs sm:text-sm">
                                  {field.value
                                    ? "Le produit est visible et peut être acheté sur le site"
                                    : "Le produit est masqué et ne peut pas être acheté"}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t px-3 sm:px-6">
                        <Button
                          type="button"
                          onClick={() => setActiveTab("basic")}
                          className="gap-2 w-full sm:w-auto text-sm sm:text-base"
                        >
                          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Retour
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("images")}
                          className="gap-2 w-full sm:w-auto text-sm sm:text-base"
                          variant={"cyna"}
                        >
                          Suivant
                          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* Onglet des images */}
                  <TabsContent
                    value="images"
                    className="space-y-4 sm:space-y-6"
                  >
                    <Card>
                      <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          Images du produit
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Images qui seront affichées sur la page du produit
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
                        <Controller
                          name="main_image"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <ImageUploader
                                field={field}
                                disabled={isSubmitting}
                                existingImage={initialData?.main_image}
                                multiple={false}
                                label="Image principale du produit"
                                helpText="Cette image sera utilisée comme visuel principal du produit."
                              />
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />

                        <Separator className="my-4 sm:my-6" />

                        <Controller
                          name="product_caroussel_images"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <ImageUploader
                                field={field}
                                disabled={isSubmitting}
                                existingImage={
                                  initialData?.product_caroussel_images
                                }
                                multiple={true}
                                label="Images supplémentaires (carrousel)"
                                helpText="Vous pouvez sélectionner plusieurs images pour le carrousel du produit."
                              />
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />

                        <Alert className="mt-4 bg-muted">
                          <FileQuestion className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <AlertTitle className="text-sm sm:text-base">
                            Conseils pour les images
                          </AlertTitle>
                          <AlertDescription className="text-xs sm:text-sm">
                            Utilisez des images au format carré de 800x800
                            pixels minimum pour un affichage optimal. Les
                            formats supportés sont JPG, JPEG, PNG et WebP.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t px-3 sm:px-6">
                        <Button
                          type="button"
                          onClick={() => setActiveTab("details")}
                          className="gap-2 w-full sm:w-auto text-sm sm:text-base"
                        >
                          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Retour
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="gap-2 w-full sm:w-auto text-sm sm:text-base"
                          variant={"cyna"}
                        >
                          {isSubmitting ? (
                            <>Enregistrement...</>
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              {isEditing ? "Mettre à jour" : "Créer le produit"}
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </form>
          </Form>
        </div>

        {/* Colonne d'aperçu - masquée sur mobile, visible sur desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Aperçu du produit
              </CardTitle>
              <CardDescription>
                Prévisualisation des informations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted relative flex items-center justify-center border">
                {watchedValues.main_image ? (
                  <Image
                    width={500}
                    height={500}
                    src={watchedValues.main_image}
                    alt={watchedValues.name || "Aperçu du produit"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                    <Package className="h-10 w-10 mb-2" />
                    <p>Aucune image sélectionnée</p>
                    <p className="text-xs mt-1">
                      L&apos;image principale sera affichée ici
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Nom
                  </p>
                  <h3 className="text-xl font-semibold">
                    {watchedValues.name || "Nom du produit"}
                  </h3>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Prix
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(Number(watchedValues.unit_price) || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Stock
                    </p>
                    <Badge
                      variant={
                        Number(watchedValues.stock) > 0
                          ? "outline"
                          : "destructive"
                      }
                    >
                      {Number(watchedValues.stock) > 0
                        ? `${watchedValues.stock} en stock`
                        : "Rupture de stock"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Catégorie
                  </p>
                  <Badge variant="secondary" className="font-normal">
                    {selectedCategory?.name || "Non sélectionnée"}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {watchedValues.description || "Description du produit..."}
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Priorité
                    </p>
                    <Badge variant="outline">
                      {watchedValues.priority_order || 1}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Statut
                    </p>
                    {watchedValues.available ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Disponible</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Indisponible
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      État du produit
                    </p>
                    {watchedValues.active ? (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Power className="h-4 w-4" />
                        <span className="text-sm font-medium">Actif</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Power className="h-4 w-4" />
                        <span className="text-sm font-medium">Inactif</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs text-muted-foreground text-center">
                  {isEditing
                    ? "Mise à jour du produit"
                    : "Création d'un nouveau produit"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
