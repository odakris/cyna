import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { validateFileType, validateFileSize } from "@/lib/utils/file-utils"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    // Validation du fichier
    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      )
    }

    // Validation du type de fichier
    const fileTypeError = validateFileType(file)
    if (fileTypeError) {
      return NextResponse.json({ error: fileTypeError }, { status: 400 })
    }

    // Récupération du buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validation de la taille
    const fileSizeError = validateFileSize(buffer)
    if (fileSizeError) {
      return NextResponse.json({ error: fileSizeError }, { status: 400 })
    }

    // Création du répertoire d'upload si nécessaire
    const uploadDir = path.join(process.cwd(), "public/uploads")
    if (!existsSync(uploadDir)) {
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (error) {
        console.error("Erreur création dossier:", error)
        return NextResponse.json(
          { error: "Erreur serveur lors de la création du dossier" },
          { status: 500 }
        )
      }
    }

    // Génération du nom de fichier unique
    const fileExt = file.name.split(".").pop() || "jpg"
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = path.join(uploadDir, fileName)

    // Écriture du fichier
    await writeFile(filePath, buffer)

    // Retour du chemin relatif pour l'accès client
    return NextResponse.json({
      success: true,
      fileName,
      filePath: `/uploads/${fileName}`,
    })
  } catch (error) {
    console.error("Erreur POST upload:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
