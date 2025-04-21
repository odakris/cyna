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
} from "lucide-react"

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
    },
  })

  // Obtenir les valeurs actuelles pour la prévisualisation
  const watchedValues = form.watch()

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setIsSubmitting(true)

      const formattedValues = {
        ...values,
        priority_order: Number(values.priority_order),
      }

      console.log("formattedValues:", formattedValues)

      if (isEditing && categoryId) {
        await fetch(`/api/categories/${categoryId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        })
      } else {
        await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        })
      }

      toast({
        title: isEditing
          ? "Catégorie mise à jour avec succès !"
          : "Catégorie créée avec succès !",
        description: isEditing
          ? "Les modifications ont été enregistrées."
          : `La catégorie "${values.name}" a été ajoutée au système.`,
      })

      router.push("/dashboard/categories")
    } catch (error) {
      console.error("Erreur onSubmit:", error)
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center gap-2"
                  >
                    <Info className="h-4 w-4" />
                    Informations de base
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className="flex items-center gap-2"
                  >
                    <FileImage className="h-4 w-4" />
                    Image
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="basic" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PencilLine className="h-5 w-5" />
                          Détails de la catégorie
                        </CardTitle>
                        <CardDescription>
                          Informations principales de la catégorie qui seront
                          visibles par les utilisateurs
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          name="name"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de la catégorie</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Entrez le nom..."
                                    {...field}
                                    disabled={isSubmitting}
                                    className="pl-9"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Nom unique qui identifie cette catégorie de
                                produits
                              </FormDescription>
                              <FormMessage />
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
                                <div className="relative">
                                  <BookText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Textarea
                                    placeholder="Décrivez cette catégorie..."
                                    {...field}
                                    disabled={isSubmitting}
                                    className="pl-9 pt-2 min-h-32"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Description détaillée de la catégorie visible
                                par les utilisateurs
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="priority_order"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priorité d&apos;affichage</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <SortAsc className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="1"
                                    {...field}
                                    disabled={isSubmitting}
                                    className="pl-9 w-full md:w-1/3"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Un nombre plus petit donne une priorité plus
                                élevée dans les listes
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push("/dashboard/categories")}
                          disabled={isSubmitting}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("image")}
                          className="gap-2"
                        >
                          Suivant
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ImageIcon className="h-5 w-5" />
                          Image de la catégorie
                        </CardTitle>
                        <CardDescription>
                          Image principale qui représente cette catégorie
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Controller
                          name="image"
                          control={form.control}
                          render={({ field }) => (
                            <ImageUploader
                              field={field}
                              disabled={isSubmitting}
                              existingImage={initialData?.image}
                            />
                          )}
                        />

                        <Alert className="mt-4 bg-muted">
                          <FileQuestion className="h-4 w-4" />
                          <AlertTitle>Conseils pour l&apos;image</AlertTitle>
                          <AlertDescription>
                            Utilisez une image au format 16:9 d&apos;au moins
                            800x450 pixels pour un affichage optimal. Les
                            formats supportés sont JPG, JPEG, PNG et WebP.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("basic")}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Retour
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
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

        {/* Colonne d'aperçu */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Aperçu de la catégorie
              </CardTitle>
              <CardDescription>
                Prévisualisation des informations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p>Aucune image sélectionnée</p>
                    <p className="text-xs mt-1">
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
                  <h3 className="text-xl font-semibold">
                    {watchedValues.name || "Nom de la catégorie"}
                  </h3>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm text-muted-foreground">
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
                      <span className="text-xs text-muted-foreground">
                        {Number(watchedValues.priority_order) === 1
                          ? "(Priorité maximale)"
                          : Number(watchedValues.priority_order) < 5
                            ? "(Haute priorité)"
                            : "(Priorité standard)"}
                      </span>
                    </div>
                  </div>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs text-muted-foreground text-center">
                  {isEditing
                    ? "Mise à jour de la catégorie"
                    : "Création d'une nouvelle catégorie"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
