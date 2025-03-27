"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
// import { createProduct, updateProduct } from "@/lib/services/product-service"
import { CategoryType } from "@/types/Types"

interface ProductFormProps {
  categories: CategoryType[]
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
  // const [available, setAvailable] = useState<boolean>(initialData?.available)

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
      available: initialData?.available && true,
      product_caroussel_images: initialData?.product_caroussel_images || [],
    },
  })

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true)

      // S'assurer que product_caroussel_images est bien un tableau
      const product_caroussel_images = Array.isArray(
        values.product_caroussel_images
      )
        ? values.product_caroussel_images
        : []

      // Formatage des valeurs avec gestion correcte des images du carrousel
      const formattedValues = {
        ...values,
        unit_price: Number(values.unit_price),
        stock: Number(values.stock),
        id_category: Number(values.id_category),
        priority_order: Number(values.priority_order),
        available: values.available,
        // S'assurer que c'est bien un tableau, même si vide
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
      console.error("Erreur onSubmit:", error)
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                label="Image Principal du Produit"
                helpText="Cette image sera utilisée comme image principale du produit."
              />
            </FormItem>
          )}
        />

        <Controller
          name="product_caroussel_images"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <ImageUploader
                field={field}
                disabled={isSubmitting}
                existingImage={initialData?.product_caroussel_images}
                multiple={true}
                label="Images du Caroussel"
                helpText="Vous pouvez sélectionner plusieurs images à la fois. Survolez une image et cliquez sur la croix pour la supprimer."
              />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="technical_specs"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spécifications Techniques</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="unit_price"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="stock"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="priority_order"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priorité</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="id_category"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem
                          key={category.id_category}
                          value={String(category.id_category)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="available"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormLabel className="text-base leading-none cursor-pointer">
                Disponible
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Enregistrement..."
            : isEditing
              ? "Mettre à jour"
              : "Ajouter"}
        </Button>
      </form>
    </Form>
  )
}
