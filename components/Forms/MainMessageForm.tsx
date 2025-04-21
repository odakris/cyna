"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Loader2,
  ArrowLeft,
  Save,
  Palette,
  AlertCircle,
  PencilLine,
} from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  MainMessageFormValues,
  mainMessageSchema,
} from "../../lib/validations/main-message-schema"

interface MainMessageFormProps {
  initialData?: {
    id_main_message?: number
    content: string
    active: boolean
    has_background: boolean
    background_color: string | null
    text_color: string | null
  }
  isEditing?: boolean
}

// Liste des couleurs disponibles pour l'arrière-plan et le texte
const backgroundColors = [
  { label: "Aucun", value: "none" },
  { label: "Bleu clair", value: "bg-blue-100" },
  { label: "Vert clair", value: "bg-green-100" },
  { label: "Rouge clair", value: "bg-red-100" },
  { label: "Jaune clair", value: "bg-yellow-100" },
  { label: "Orange clair", value: "bg-orange-100" },
  { label: "Violet clair", value: "bg-purple-100" },
  { label: "Gris clair", value: "bg-gray-100" },
  { label: "Primaire (10%)", value: "bg-primary/10" },
]

const textColors = [
  { label: "Aucun", value: "none" },
  { label: "Noir", value: "text-black" },
  { label: "Blanc", value: "text-white" },
  { label: "Bleu", value: "text-blue-700" },
  { label: "Vert", value: "text-green-700" },
  { label: "Rouge", value: "text-red-700" },
  { label: "Jaune", value: "text-yellow-700" },
  { label: "Orange", value: "text-orange-700" },
  { label: "Violet", value: "text-purple-700" },
  { label: "Gris", value: "text-gray-700" },
  { label: "Primaire", value: "text-primary" },
]

export function MainMessageForm({
  initialData,
  isEditing = false,
}: MainMessageFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewStyle, setPreviewStyle] = useState({
    content: initialData?.content || "",
    backgroundColor:
      initialData?.has_background && initialData?.background_color
        ? initialData.background_color
        : "bg-primary/10",
    textColor: initialData?.text_color || "text-foreground",
  })

  // Initialiser le formulaire
  const form = useForm<MainMessageFormValues>({
    resolver: zodResolver(mainMessageSchema),
    defaultValues: {
      content: initialData?.content || "",
      active: initialData?.active ?? true,
      has_background: initialData?.has_background ?? false,
      background_color: initialData?.background_color || "",
      text_color: initialData?.text_color || "",
    },
  })

  // Mise à jour de l'aperçu en temps réel
  const updatePreview = React.useCallback(
    (field: keyof typeof previewStyle, value: string) => {
      setPreviewStyle(prev => ({
        ...prev,
        [field]: value,
      }))
    },
    []
  )

  // Surveiller les changements de formulaire pour mettre à jour l'aperçu
  React.useEffect(() => {
    const { watch } = form
    const subscription = watch((value, { name }) => {
      if (name === "content") {
        updatePreview("content", value.content || "")
      }
      if (name === "background_color") {
        updatePreview(
          "backgroundColor",
          value.background_color || "bg-primary/10"
        )
      }
      if (name === "text_color") {
        updatePreview("textColor", value.text_color || "text-foreground")
      }
    })
    return () => subscription.unsubscribe()
  }, [form, updatePreview])

  // Soumettre le formulaire
  const onSubmit = async (data: MainMessageFormValues) => {
    try {
      setIsSubmitting(true)

      const endpoint = isEditing
        ? `/api/main-message/${initialData?.id_main_message}`
        : "/api/main-message"

      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Une erreur est survenue")
      }

      toast({
        title: isEditing ? "Message mis à jour" : "Message créé",
        description: isEditing
          ? "Le message a été mis à jour avec succès."
          : "Le nouveau message a été créé avec succès.",
      })

      // Rediriger vers la liste des messages
      router.push("/dashboard/main-message")
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Première colonne */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PencilLine className="h-5 w-5" />
                  Contenu du message
                </CardTitle>
                <CardDescription>
                  Texte qui sera affiché sur la page d&apos;accueil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Entrez le message à afficher..."
                          className="resize-none min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Ce message sera affiché sur la page d&apos;accueil si
                        actif
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Soyez concis</AlertTitle>
                  <AlertDescription>
                    Les messages trop longs peuvent nuire à l&apos;expérience
                    utilisateur. Limitez-vous à une phrase claire et impactante.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres</CardTitle>
                <CardDescription>
                  Configuration du statut et de l&apos;affichage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Activer le message
                        </FormLabel>
                        <FormDescription>
                          Lorsqu&apos;il est activé, ce message s&apos;affiche
                          sur la page d&apos;accueil (désactive automatiquement
                          les autres messages)
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
                  name="has_background"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Arrière-plan coloré
                        </FormLabel>
                        <FormDescription>
                          Appliquer la couleur d&apos;arrière-plan sélectionnée
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
              </CardContent>
            </Card>
          </div>

          {/* Deuxième colonne */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Aperçu
                </CardTitle>
                <CardDescription>
                  Visualisez le message tel qu&apos;il apparaîtra sur le site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`p-4 rounded-md ${previewStyle.backgroundColor}`}
                >
                  <p
                    className={`text-center font-medium ${previewStyle.textColor}`}
                  >
                    {previewStyle.content || "Aperçu du message..."}
                  </p>
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="background_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur d&apos;arrière-plan</FormLabel>
                      <Select
                        onValueChange={value => {
                          field.onChange(value)
                          updatePreview(
                            "backgroundColor",
                            value || "bg-primary/10"
                          )
                        }}
                        value={field.value || ""}
                        disabled={!form.getValues("has_background")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une couleur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {backgroundColors.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded ${color.value || "bg-primary/10"}`}
                                />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Sera appliqué uniquement si l&apos;arrière-plan est
                        activé
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="text_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur du texte</FormLabel>
                      <Select
                        onValueChange={value => {
                          field.onChange(value)
                          updatePreview(
                            "textColor",
                            value === "none" ? "text-foreground" : value
                          )
                        }}
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une couleur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {textColors.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{
                                    backgroundColor:
                                      color.value === "none"
                                        ? "#E5E7EB"
                                        : color.value === "text-black"
                                          ? "#000000"
                                          : color.value === "text-white"
                                            ? "#FFFFFF"
                                            : color.value === "text-blue-700"
                                              ? "#1D4ED8"
                                              : color.value === "text-green-700"
                                                ? "#047857"
                                                : color.value === "text-red-700"
                                                  ? "#B91C1C"
                                                  : color.value ===
                                                      "text-yellow-700"
                                                    ? "#A16207"
                                                    : color.value ===
                                                        "text-orange-700"
                                                      ? "#C2410C"
                                                      : color.value ===
                                                          "text-purple-700"
                                                        ? "#7E22CE"
                                                        : color.value ===
                                                            "text-gray-700"
                                                          ? "#374151"
                                                          : color.value ===
                                                              "text-primary"
                                                            ? "var(--primary)"
                                                            : "#E5E7EB",
                                    border:
                                      color.value === "text-white"
                                        ? "1px solid #E5E7EB"
                                        : "none",
                                  }}
                                />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Couleur du texte du message
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
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing
                        ? "Mettre à jour le message"
                        : "Créer le message"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/main-message")}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}
