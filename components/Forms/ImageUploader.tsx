"use client"

import { useState, useEffect, useRef } from "react"
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/lib/services/upload-service"
import { ControllerRenderProps } from "react-hook-form"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploaderProps {
  field: ControllerRenderProps<any, any>
  disabled?: boolean
  existingImage?: string | string[]
  multiple?: boolean
  label?: string
  helpText?: string
}

export function ImageUploader({
  field,
  disabled = false,
  existingImage,
  multiple = false,
  label,
  helpText,
}: ImageUploaderProps) {
  const { toast } = useToast()
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)

  const initialRenderRef = useRef(true)

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false

      // Initialiser l'aperçu avec l'image existante si disponible
      if (existingImage) {
        if (multiple && Array.isArray(existingImage)) {
          setPreviewImages(existingImage)
          field.onChange(existingImage) // Mettre à jour le champ avec toutes les images
        } else if (!multiple && typeof existingImage === "string") {
          setPreviewImages([existingImage])
          field.onChange(existingImage) // Mettre à jour le champ avec l'image unique
        } else {
          setPreviewImages(multiple ? [] : [])
          field.onChange(multiple ? [] : "") // Réinitialiser le champ si aucune image n'est fournie
        }
      } else {
        setPreviewImages([])
        field.onChange(multiple ? [] : "") // Réinitialiser le champ si aucune image n'est fournie
      }
    }
  }, [existingImage, multiple, field])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || files.length === 0) {
      return
    }

    try {
      setUploadingImage(true)

      if (multiple) {
        // Créer un tableau pour stocker les chemins des images téléchargées
        const uploadedImagePaths: string[] = [...previewImages]

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const filePath = await uploadImage(file)
          uploadedImagePaths.push(filePath)
        }

        setPreviewImages(uploadedImagePaths)
        field.onChange(uploadedImagePaths) // Mettre à jour le champ avec toutes les images

        toast({
          variant: "success",
          description: "Images téléchargées avec succès",
          title: "Images téléchargées",
        })
      } else {
        const filePath = await uploadImage(files[0])
        setPreviewImages([filePath])
        field.onChange(filePath) // Mettre à jour la valeur du champ

        toast({
          variant: "success",
          description: "Image téléchargée avec succès",
          title: "Image téléchargée",
        })
      }
    } catch (error) {
      console.error("Erreur upload image:", error)
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de télécharger l'image",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
      e.target.value = "" // Réinitialiser le champ de fichier
    }
  }

  const handleRemoveImage = (index: number) => {
    if (multiple) {
      const newImages = [...previewImages]
      newImages.splice(index, 1)
      setPreviewImages(newImages)
      field.onChange(newImages)

      field.onBlur()
    } else {
      setPreviewImages([])
      field.onChange("")
      field.onBlur()
    }
  }

  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              multiple={multiple}
              disabled={disabled || uploadingImage}
              onChange={handleFileChange}
              className="flex-1"
            />
          </div>

          {uploadingImage && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground flex items-center">
                <span className="animate-spin mr-2">⏳</span>
                Téléchargement en cours...
              </p>
            </div>
          )}

          {helpText && (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          )}
        </div>
      </FormControl>

      {/* Aperçu pour une seule image */}
      {!multiple && previewImages.length > 0 && (
        <div className="mt-3">
          <div className="relative group inline-block">
            <Image
              src={previewImages[0]}
              alt="Aperçu de l'image"
              width={300}
              height={200}
              className="h-48 w-auto object-contain rounded-lg border"
              priority
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(0)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Aperçu pour plusieurs images */}
      {multiple && previewImages.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {previewImages.map((image, index) => (
            <div key={`image-${index}-${image}`} className="relative group">
              <Image
                src={image}
                alt={`Image ${index + 1}`}
                width={200}
                height={150}
                className="h-32 w-full object-cover rounded-lg border"
                priority
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <FormMessage />
    </FormItem>
  )
}
