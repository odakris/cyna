"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Loader2,
  PencilLine,
  ImageIcon,
  BarChart3,
  Layout,
  Tag,
  FileImage,
  AlertCircle,
} from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUploader } from "@/components/Forms/ImageUploader"
import {
  HeroCarouselFormValues,
  heroCarouselSchema,
} from "@/lib/validations/hero-carousel-schema"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, FileQuestion } from "lucide-react"

interface HeroCarouselFormProps {
  initialData?: HeroCarouselFormValues & { id_hero_slide?: number }
  isEditing?: boolean
  onSubmit: (data: HeroCarouselFormValues) => Promise<void>
}

export function HeroCarouselForm({
  initialData,
  isEditing = false,
  onSubmit,
}: HeroCarouselFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Initialiser le formulaire
  const form = useForm<HeroCarouselFormValues>({
    resolver: zodResolver(heroCarouselSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      image_url: initialData?.image_url || "",
      button_text: initialData?.button_text || "",
      button_link: initialData?.button_link || "",
      active: initialData?.active ?? true,
      priority_order: initialData?.priority_order || 1,
    },
  })

  const formErrors = form.formState.errors

  // Liste des erreurs à afficher
  const errorMessages = Object.entries(formErrors).map(([field, error]) => {
    const fieldLabels: { [key: string]: string } = {
      title: "Titre",
      description: "Description",
      image_url: "Image",
      button_text: "Texte du bouton",
      button_link: "Lien du bouton",
      priority_order: "Ordre de priorité",
    }

    return {
      field: fieldLabels[field] || field,
      message: error?.message || "Valeur invalide",
    }
  })

  const handleSubmit = async (data: HeroCarouselFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      // console.error("Erreur lors de la soumission du formulaire:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 sm:space-y-6"
      >
        {/* Alerte pour les erreurs de validation */}
        {errorMessages.length > 0 && (
          <Alert variant="destructive" className="mb-6">
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
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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
                  <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Informations de base</span>
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
                        Détails essentiels du slide
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Informations principales du slide qui seront visibles
                        par les utilisateurs
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">
                              Titre*
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Titre du slide"
                                  {...field}
                                  className="pl-9 text-sm sm:text-base h-9 sm:h-10"
                                />
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs sm:text-sm">
                              Le titre principal qui sera affiché sur le slide
                            </FormDescription>
                            <FormMessage className="text-xs sm:text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">
                              Description
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Layout className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Textarea
                                  placeholder="Description du slide"
                                  className="resize-none min-h-24 sm:min-h-32 pl-9 pt-2 text-sm sm:text-base"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs sm:text-sm">
                              Description optionnelle qui apparaîtra sous le
                              titre
                            </FormDescription>
                            <FormMessage className="text-xs sm:text-sm" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <FormField
                          control={form.control}
                          name="button_text"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">
                                Texte du bouton
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="En savoir plus"
                                    {...field}
                                    value={field.value || ""}
                                    className="pl-9 text-sm sm:text-base h-9 sm:h-10"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs sm:text-sm">
                                Texte affiché sur le bouton d&apos;action
                              </FormDescription>
                              <FormMessage className="text-xs sm:text-sm" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="button_link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm sm:text-base">
                                Lien du bouton
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Layout className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="/produits"
                                    {...field}
                                    value={field.value || ""}
                                    className="pl-9 text-sm sm:text-base h-9 sm:h-10"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs sm:text-sm">
                                URL de destination lorsque le bouton est cliqué
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
                        onClick={() => router.push("/dashboard/hero-carousel")}
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
                        Image
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Image d&apos;arrière-plan du slide
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
                      <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                          <FormItem>
                            <ImageUploader
                              field={field}
                              existingImage={initialData?.image_url}
                              multiple={false}
                              label="Image du slide*"
                              helpText="Choisissez une image de bonne qualité pour l'arrière-plan du slide (format recommandé : 1920 x 1080 pixels)"
                              disabled={isSubmitting}
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
                          Utilisez une image au format 16:9, de haute résolution
                          (1920 x 1080 pixels minimum) pour une qualité
                          optimale. Les formats supportés sont JPG, JPEG, PNG et
                          WebP.
                        </AlertDescription>
                      </Alert>

                      <FormField
                        control={form.control}
                        name="priority_order"
                        render={({ field }) => (
                          <FormItem className="mt-4">
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
                              Les slides sont affichés par ordre croissant de
                              priorité (1 sera affiché en premier)
                            </FormDescription>
                            <FormMessage className="text-xs sm:text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm sm:text-base">
                                Activer le slide
                              </FormLabel>
                              <FormDescription className="text-xs sm:text-sm">
                                {field.value
                                  ? "Le slide est visible sur le site"
                                  : "Le slide n'apparaîtra pas sur le site"}
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
                        type="submit"
                        className="w-full sm:w-auto gap-2 text-sm sm:text-base"
                        variant={"cyna"}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                            {isEditing ? "Mise à jour..." : "Création..."}
                          </>
                        ) : isEditing ? (
                          "Mettre à jour le slide"
                        ) : (
                          "Créer le slide"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Colonne latérale - actions et paramètres */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  Aperçu du slide
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Vérifiez les informations avant de soumettre
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="bg-muted/40 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Titre
                    </p>
                    <p className="font-semibold text-sm sm:text-base">
                      {form.watch("title") || "Aucun titre défini"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Description
                    </p>
                    <p className="text-xs sm:text-sm line-clamp-2">
                      {form.watch("description") ||
                        "Aucune description définie"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Bouton
                    </p>
                    <p className="text-xs sm:text-sm">
                      {form.watch("button_text")
                        ? `"${form.watch("button_text")}" → ${form.watch("button_link") || "/"}`
                        : "Aucun bouton défini"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Priorité
                    </p>
                    <p className="text-xs sm:text-sm">
                      {form.watch("priority_order") || 1}
                      {form.watch("priority_order") <= 3
                        ? " (Haute priorité)"
                        : form.watch("priority_order") <= 7
                          ? " (Priorité moyenne)"
                          : " (Priorité basse)"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Statut
                    </p>
                    <p className="text-xs sm:text-sm">
                      {form.watch("active") ? "Actif" : "Inactif"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4 sm:mt-6">
                  <Button
                    type="submit"
                    className="w-full gap-2 text-sm sm:text-base"
                    variant={"cyna"}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                        {isEditing ? "Mise à jour..." : "Création..."}
                      </>
                    ) : isEditing ? (
                      "Mettre à jour le slide"
                    ) : (
                      "Créer le slide"
                    )}
                  </Button>
                  <Button
                    type="button"
                    className="w-full text-sm sm:text-base"
                    onClick={() => router.push("/dashboard/hero-carousel")}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/50 pt-4 sm:pt-6 border-t px-3 sm:px-6">
                <p className="text-xs sm:text-sm text-muted-foreground italic">
                  {isEditing
                    ? "Modifiez les détails du slide puis cliquez sur Mettre à jour"
                    : "Remplissez les champs puis cliquez sur Créer le slide"}
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}
