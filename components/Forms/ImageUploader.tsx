"use client"

import { useState, useEffect } from "react"
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { uploadImage } from "@/lib/services/uploadService"
import { ControllerRenderProps } from "react-hook-form"

interface ImageUploaderProps {
  field: ControllerRenderProps<any, "image">
  disabled?: boolean
  existingImage?: string
}

export function ImageUploader({
  field,
  disabled = false,
  existingImage,
}: ImageUploaderProps) {
  const { toast } = useToast()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)

  useEffect(() => {
    // Initialiser l'aperçu avec l'image existante si disponible
    if (existingImage) {
      setPreviewImage(existingImage)
    }
  }, [existingImage])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    try {
      setUploadingImage(true)

      const filePath = await uploadImage(file)

      field.onChange(filePath)
      setPreviewImage(filePath)

      toast({
        title: "Image téléchargée avec succès",
      })
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
    }
  }

  return (
    <FormItem>
      <FormLabel>Image du produit</FormLabel>
      <FormControl>
        <div>
          <Input
            type="file"
            accept="image/*"
            disabled={disabled || uploadingImage}
            onChange={handleFileChange}
          />
          {uploadingImage && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground flex items-center">
                <span className="animate-spin mr-2">⏳</span>
                Téléchargement en cours...
              </p>
            </div>
          )}
        </div>
      </FormControl>
      {previewImage && (
        <Image
          src={previewImage}
          alt="Aperçu du produit"
          width={256}
          height={128}
          className="mt-2 h-32 object-cover rounded-lg"
          priority
        />
      )}
      <FormMessage />
    </FormItem>
  )
}
