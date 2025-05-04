"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquareText,
  Save,
  Palette,
  SlidersHorizontal,
} from "lucide-react"
import Link from "next/link"
import {
  mainMessageSchema,
  MainMessageFormValues,
} from "@/lib/validations/main-message-schema"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Définition des options de couleur d'arrière-plan
const backgroundColorOptions = [
  { value: "Par défaut", label: "Par défaut" },
  // Couleurs CYNA
  { value: "bg-[#302082]", label: "CYNA Primaire (Violet)" },
  { value: "bg-[#302082]/90", label: "CYNA Primaire (90%)" },
  { value: "bg-[#302082]/75", label: "CYNA Primaire (75%)" },
  { value: "bg-[#302082]/50", label: "CYNA Primaire (50%)" },
  { value: "bg-[#302082]/25", label: "CYNA Primaire (25%)" },
  { value: "bg-[#302082]/10", label: "CYNA Primaire (10%)" },
  { value: "bg-[#FF6B00]", label: "CYNA Secondaire (Orange)" },
  { value: "bg-[#FF6B00]/90", label: "CYNA Secondaire (90%)" },
  { value: "bg-[#FF6B00]/75", label: "CYNA Secondaire (75%)" },
  { value: "bg-[#FF6B00]/50", label: "CYNA Secondaire (50%)" },
  { value: "bg-[#FF6B00]/25", label: "CYNA Secondaire (25%)" },
  { value: "bg-[#FF6B00]/10", label: "CYNA Secondaire (10%)" },
  { value: "bg-[#F2F2F2]", label: "CYNA Tertiaire (Gris clair)" },
  // Couleurs standards
  { value: "bg-white", label: "Blanc" },
  { value: "bg-black", label: "Noir" },
  { value: "bg-gray-50", label: "Gris très clair" },
  { value: "bg-gray-100", label: "Gris clair" },
  { value: "bg-gray-200", label: "Gris" },
  { value: "bg-gray-300", label: "Gris moyen" },
  { value: "bg-gray-400", label: "Gris foncé" },
  // Autres couleurs
  { value: "bg-blue-100", label: "Bleu clair" },
  { value: "bg-green-100", label: "Vert clair" },
  { value: "bg-red-100", label: "Rouge clair" },
  { value: "bg-yellow-100", label: "Jaune clair" },
  { value: "bg-indigo-100", label: "Indigo clair" },
  { value: "bg-purple-100", label: "Violet clair" },
  { value: "bg-pink-100", label: "Rose clair" },
]

// Définition des options de couleur de texte
const textColorOptions = [
  { value: "Par défaut", label: "Par défaut" },
  // Couleurs CYNA
  { value: "text-[#302082]", label: "CYNA Primaire (Violet)" },
  { value: "text-[#302082]/90", label: "CYNA Primaire (90%)" },
  { value: "text-[#302082]/75", label: "CYNA Primaire (75%)" },
  { value: "text-[#302082]/50", label: "CYNA Primaire (50%)" },
  { value: "text-[#FF6B00]", label: "CYNA Secondaire (Orange)" },
  { value: "text-[#FF6B00]/90", label: "CYNA Secondaire (90%)" },
  { value: "text-[#FF6B00]/75", label: "CYNA Secondaire (75%)" },
  { value: "text-[#FF6B00]/50", label: "CYNA Secondaire (50%)" },
  // Couleurs standards
  { value: "text-white", label: "Blanc" },
  { value: "text-black", label: "Noir" },
  { value: "text-gray-50", label: "Gris très clair" },
  { value: "text-gray-400", label: "Gris moyen" },
  { value: "text-gray-500", label: "Gris" },
  { value: "text-gray-600", label: "Gris foncé" },
  { value: "text-gray-700", label: "Gris très foncé" },
  { value: "text-gray-900", label: "Presque noir" },
  // Autres couleurs
  { value: "text-blue-600", label: "Bleu" },
  { value: "text-green-600", label: "Vert" },
  { value: "text-red-600", label: "Rouge" },
  { value: "text-yellow-600", label: "Jaune" },
  { value: "text-indigo-600", label: "Indigo" },
  { value: "text-purple-600", label: "Violet" },
  { value: "text-pink-600", label: "Rose" },
]

interface MainMessageFormProps {
  initialData?: MainMessageFormValues
  isEditing?: boolean
  isSubmitting?: boolean
  onSubmit: (data: MainMessageFormValues) => Promise<void>
}

export default function MainMessageForm({
  initialData,
  isEditing = false,
  isSubmitting = false,
  onSubmit,
}: MainMessageFormProps) {
  const [activeTab, setActiveTab] = useState("content")

  const defaultValues: MainMessageFormValues = {
    content: "",
    active: true,
    has_background: false,
    background_color: "Par défaut",
    text_color: "Par défaut",
  }

  const form = useForm<MainMessageFormValues>({
    resolver: zodResolver(mainMessageSchema),
    defaultValues: initialData || defaultValues,
  })

  const watchedValues = form.watch()

  const handleFormSubmit = async (data: MainMessageFormValues) => {
    const transformedData = {
      ...data,
      background_color:
        data.background_color === "Par défaut" ? "" : data.background_color,
      text_color: data.text_color === "Par défaut" ? "" : data.text_color,
    }
    await onSubmit(transformedData)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale avec le formulaire */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
              <Tabs
                defaultValue="content"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="content"
                    className="flex items-center gap-2"
                  >
                    <MessageSquareText className="h-4 w-4" />
                    Contenu
                  </TabsTrigger>
                  <TabsTrigger
                    value="appearance"
                    className="flex items-center gap-2"
                  >
                    <Palette className="h-4 w-4" />
                    Apparence
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  {/* Onglet du contenu */}
                  <TabsContent value="content" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquareText className="h-5 w-5" />
                          Contenu du message
                        </CardTitle>
                        <CardDescription>
                          Texte qui sera affiché aux utilisateurs
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          name="content"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Texte du message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Saisissez le contenu du message..."
                                  className="min-h-32 resize-y"
                                  {...field}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormDescription>
                                Le message principal affiché sur la page
                                d&apos;accueil (maximum 500 caractères)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="active"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Activation du message
                                </FormLabel>
                                <FormDescription>
                                  {field.value
                                    ? "Le message est visible sur le site"
                                    : "Le message est masqué"}
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
                      <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                          type="button"
                          onClick={() => setActiveTab("appearance")}
                          className="gap-2"
                          variant={"cyna"}
                        >
                          Suite
                          <Palette className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* Onglet d'apparence */}
                  <TabsContent value="appearance" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Apparence du message
                        </CardTitle>
                        <CardDescription>
                          Personnalisation visuelle du message
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Menu déroulant pour la couleur d'arrière-plan */}
                        <FormField
                          name="background_color"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Couleur d&apos;arrière-plan</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value ?? undefined}
                                value={field.value ?? ""}
                                disabled={isSubmitting}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionnez une couleur" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {backgroundColorOptions.map(option => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={cn(
                                            "w-4 h-4 rounded border border-gray-300",
                                            option.value !== "Par défaut"
                                              ? option.value
                                              : "bg-primary/5"
                                          )}
                                        ></div>
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Sélectionnez une couleur d&apos;arrière-plan
                                pour votre message
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Menu déroulant pour la couleur du texte */}
                        <FormField
                          name="text_color"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Couleur du texte</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value ?? undefined}
                                value={field.value ?? ""}
                                disabled={isSubmitting}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionnez une couleur" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {textColorOptions.map(option => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={cn(
                                            "w-4 h-4 rounded border border-gray-300",
                                            option.value !== "Par défaut"
                                              ? option.value.replace(
                                                  "text-",
                                                  "bg-"
                                                )
                                              : "bg-foreground",
                                            option.value.includes("white")
                                              ? "border-gray-300"
                                              : "border-transparent"
                                          )}
                                        ></div>
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Sélectionnez une couleur pour le texte de votre
                                message
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" asChild>
                            <Link href="/dashboard/main-message">Annuler</Link>
                          </Button>
                          <Button
                            type="submit"
                            className="gap-2"
                            disabled={isSubmitting}
                            variant={"cyna"}
                          >
                            {isSubmitting ? (
                              <>Enregistrement...</>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                {isEditing
                                  ? "Mettre à jour"
                                  : "Créer le message"}
                              </>
                            )}
                          </Button>
                        </div>
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
                <SlidersHorizontal className="h-4 w-4" />
                Aperçu du message
              </CardTitle>
              <CardDescription>Prévisualisation en temps réel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className={cn(
                  "p-6 rounded-md border transition-colors",
                  watchedValues.background_color &&
                    watchedValues.background_color !== "Par défaut"
                    ? watchedValues.background_color
                    : "bg-primary/5"
                )}
              >
                <p
                  className={cn(
                    "text-lg text-center font-bold",
                    watchedValues.text_color &&
                      watchedValues.text_color !== "Par défaut"
                      ? watchedValues.text_color
                      : "text-foreground"
                  )}
                >
                  {watchedValues.content || "Aperçu du message..."}
                </p>
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Statut:
                  </p>
                  <Badge
                    variant={watchedValues.active ? "default" : "outline"}
                    className={
                      watchedValues.active
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {watchedValues.active ? "Actif" : "Inactif"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Arrière-plan:
                  </p>
                  <Badge
                    variant={
                      watchedValues.background_color !== "Par défaut"
                        ? "default"
                        : "outline"
                    }
                    className={
                      watchedValues.background_color !== "Par défaut"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {watchedValues.background_color !== "Par défaut"
                      ? "Personnalisé"
                      : "Par défaut"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
