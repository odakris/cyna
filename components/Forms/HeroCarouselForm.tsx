"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
} from "../../lib/validations/hero-carousel-schema"

interface HeroCarouselFormProps {
  initialData?: HeroCarouselFormValues & { id_hero_slide?: number }
  isEditing?: boolean
}

export function HeroCarouselForm({
  initialData,
  isEditing = false,
}: HeroCarouselFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

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
      priority_order: initialData?.priority_order || 999,
    },
  })

  // Soumettre le formulaire
  const onSubmit = async (data: HeroCarouselFormValues) => {
    try {
      setIsSubmitting(true)

      // Nettoyer les données si nécessaire
      const formattedData = {
        ...data,
        description: data.description || null,
        button_text: data.button_text || null,
        button_link: data.button_link || null,
        priority_order: Number(data.priority_order),
      }

      const endpoint = isEditing
        ? `/api/hero-carousel/${initialData?.id_hero_slide}`
        : "/api/hero-carousel"

      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Une erreur est survenue")
      }

      toast({
        title: isEditing ? "Slide mis à jour" : "Slide créé",
        description: isEditing
          ? "Le slide a été mis à jour avec succès."
          : "Le nouveau slide a été créé avec succès.",
      })

      // Rediriger vers la liste des slides
      router.push("/dashboard/hero-carousel")
      router.refresh()
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur inconnue est survenue",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations principales</CardTitle>
                <CardDescription>Détails essentiels du slide</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre*</FormLabel>
                      <FormControl>
                        <Input placeholder="Titre du slide" {...field} />
                      </FormControl>
                      <FormDescription>
                        Le titre principal qui sera affiché sur le slide
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description du slide"
                          className="resize-none min-h-32"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Description optionnelle qui apparaîtra sous le titre
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="button_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texte du bouton</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="En savoir plus"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Texte affiché sur le bouton d&apos;action
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="button_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lien du bouton</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="/produits"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          URL de destination lorsque le bouton est cliqué
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Image</CardTitle>
                <CardDescription>
                  Image d&apos;arrière-plan du slide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <ImageUploader
                      field={field}
                      existingImage={initialData?.image_url}
                      multiple={false}
                      label="Image du slide*"
                      helpText="Choisissez une image de bonne qualité pour l'arrière-plan du slide (format recommandé : 1920 x 1080 pixels)"
                    />
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres</CardTitle>
                <CardDescription>Configuration du slide</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Activer le slide
                        </FormLabel>
                        <FormDescription>
                          Lorsqu&apos;il est désactivé, le slide
                          n&apos;apparaîtra pas sur le site
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordre de priorité</FormLabel>
                      <Select
                        onValueChange={value => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez la priorité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">
                            1 - Très haute priorité
                          </SelectItem>
                          <SelectItem value="2">2 - Haute priorité</SelectItem>
                          <SelectItem value="3">3 - Priorité élevée</SelectItem>
                          <SelectItem value="5">
                            5 - Priorité moyenne
                          </SelectItem>
                          <SelectItem value="7">
                            7 - Priorité normale
                          </SelectItem>
                          <SelectItem value="10">
                            10 - Priorité basse
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Les slides sont affichés par ordre croissant de priorité
                        (1 sera affiché en premier)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/hero-carousel")}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              </CardContent>
              <CardFooter className="bg-muted/50 pt-6 border-t">
                <p className="text-sm text-muted-foreground italic">
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
