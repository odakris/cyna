"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import Image from "next/image"
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
import { ImageUploader } from "@/components/Forms/ImageUploader"
import {
  categoryFormSchema,
  CategoryFormValues,
} from "@/lib/validations/category-schema"
import {
  Save,
  ImageIcon,
  SortAsc,
  BookText,
  Info,
  Tag,
  Pencil,
  FileImage,
  ArrowLeft,
  ArrowUpDown,
  FileQuestion,
  ArrowRight,
  PencilLine,
  Power,
  AlertCircle,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface CategoryFormProps {
  initialData?: CategoryFormValues
  isEditing?: boolean
  categoryId?: number
}

export function CategoryForm({
  initialData,
  isEditing = false,
  categoryId,
}: CategoryFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState("basic")

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      image: initialData?.image || "",
      priority_order: initialData?.priority_order || 1,
      active: initialData?.active ?? true,
    },
  })

  const watchedValues = form.watch()
  const formErrors = form.formState.errors

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setIsSubmitting(true)

      const formattedValues = {
        ...values,
        active: values.active,
        priority_order: Number(values.priority_order),
      }

      console.log("formattedValues:", formattedValues)

      let response
      if (isEditing && categoryId) {
        response = await fetch(`/api/categories/${categoryId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message || "Erreur lors de la mise à jour de la catégorie"
          )
        }

        toast({
          title: "Catégorie mise à jour avec succès !",
          description: "Les modifications ont été enregistrées.",
          variant: "success",
        })
      } else {
        response = await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message || "Erreur lors de la création de la catégorie"
          )
        }

        toast({
          title: "Catégorie créée avec succès !",
          description: `La catégorie "${values.name}" a été ajoutée au système.`,
          variant: "success",
        })
      }

      router.push("/dashboard/categories")
    } catch (error) {
      // console.error("Erreur onSubmit:", error)
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : `Erreur lors de la ${isEditing ? "mise à jour" : "création"} de la catégorie.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Liste des erreurs à afficher
  const errorMessages = Object.entries(formErrors).map(([field, error]) => {
    const fieldLabels: { [key: string]: string } = {
      name: "Nom de la catégorie",
      description: "Description",
      image: "Image de la catégorie",
      priority_order: "Priorité d'affichage",
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
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs
                defaultValue="basic"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
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
                    value="image"
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    <FileImage className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Image</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4 sm:mt-6">
                  <TabsContent value="basic" className="space-y-4 sm:space-y-6">
                    <Card>
                      <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <PencilLine className="h-4 w-4 sm:h-5 sm:w-5" />
                          Détails de la catégorie
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Informations principales de la catégorie qui seront
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
                                Nom de la catégorie
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Entrez le nom..."
                                    {...field}
                                    disabled={isSubmitting}
                                    className="pl-9 text-sm sm:text-base h-9 sm:h-10"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs sm:text-sm">
                                Nom unique qui identifie cette catégorie de
                                produits
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
                                Description
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <BookText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Textarea
                                    placeholder="Décrivez cette catégorie..."
                                    {...field}
                                    disabled={isSubmitting}
                                    className="pl-9 pt-2 min-h-24 sm:min-h-32 text-sm sm:text-base"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs sm:text-sm">
                                Description détaillée de la catégorie visible
                                par les utilisateurs
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
                                  <SortAsc className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                                Les catégories sont affichées par ordre
                                croissant de priorité (1 sera affiché en
                                premier)
                              </FormDescription>
                              <FormMessage className="text-xs sm:text-sm" />
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
                                  Activation de la catégorie
                                </FormLabel>
                                <FormDescription className="text-xs sm:text-sm">
                                  {field.value
                                    ? "La catégorie et ses produits associés sont visibles"
                                    : "La catégorie et ses produits associés ne sont pas visibles"}
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
                          onClick={() => router.push("/dashboard/categories")}
                          disabled={isSubmitting}
                          className="w-full sm:w-auto text-sm sm:text-base"
                        >
                          Annuler
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("image")}
                          className="gap-2 w-full sm:w-auto text-sm sm:text-base"
                          variant={"cyna"}
                        >
                          Suivant
                          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4 sm:space-y-6">
                    <Card>
                      <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          Image de la catégorie
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Image principale qui représente cette catégorie
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
                        <Controller
                          name="image"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <ImageUploader
                                field={field}
                                disabled={isSubmitting}
                                existingImage={initialData?.image}
                                multiple={false}
                                label="Image de la catégorie"
                                helpText="Cette image sera utilisée pour représenter la catégorie."
                              />
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />

                        <Alert className="mt-4 bg-muted">
                          <FileQuestion className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <AlertTitle className="text-sm sm:text-base">
                            Conseils pour l&apos;image
                          </AlertTitle>
                          <AlertDescription className="text-xs sm:text-sm">
                            Utilisez une image au format 16:9 d&apos;au moins
                            800x450 pixels pour un affichage optimal. Les
                            formats supportés sont JPG, JPEG, PNG et WebP.
                          </AlertDescription>
                        </Alert>
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
                              {isEditing
                                ? "Mettre à jour"
                                : "Créer la catégorie"}
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

        <div className="hidden lg:block lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                Aperçu de la catégorie
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Prévisualisation des informations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted relative flex items-center justify-center border">
                {watchedValues.image ? (
                  <Image
                    width={500}
                    height={500}
                    src={watchedValues.image}
                    alt={watchedValues.name || "Aperçu de la catégorie"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                    <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 mb-2" />
                    <p className="text-sm sm:text-base">
                      Aucune image sélectionnée
                    </p>
                    <p className="text-xs sm:text-sm mt-1">
                      L&apos;image sera affichée ici
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Nom
                  </p>
                  <h3 className="text-lg sm:text-xl font-semibold">
                    {watchedValues.name || "Nom de la catégorie"}
                  </h3>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                    {watchedValues.description ||
                      "Description de la catégorie..."}
                  </p>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Priorité
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {watchedValues.priority_order || 1}
                      </Badge>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {Number(watchedValues.priority_order) === 1
                          ? "(Priorité maximale)"
                          : Number(watchedValues.priority_order) < 5
                            ? "(Haute priorité)"
                            : "(Priorité standard)"}
                      </span>
                    </div>
                  </div>
                  <ArrowUpDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      État de la catégorie
                    </p>
                    {watchedValues.active ? (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Power className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm sm:text-base font-medium">
                          Actif
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Power className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm sm:text-base font-medium">
                          Inactif
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    {isEditing
                      ? "Mise à jour de la catégorie"
                      : "Création d'une nouvelle catégorie"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
