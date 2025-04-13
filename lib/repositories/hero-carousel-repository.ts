import { HeroCarouselSlide } from "@prisma/client"
import { prisma } from "../prisma"
import { TransactionClient } from "@/types/Types"
import { HeroCarouselFormValues } from "@/lib/validations/hero-carousel-schema"

export const findAll = async (): Promise<HeroCarouselSlide[]> => {
  try {
    return prisma.heroCarouselSlide.findMany({
      orderBy: {
        priority_order: "asc",
      },
    })
  } catch (error) {
    console.error("Repository - Error fetching all slides:", error)
    throw error
  }
}

export const findById = async (
  id: number
): Promise<HeroCarouselSlide | null> => {
  try {
    return prisma.heroCarouselSlide.findUnique({
      where: { id_hero_slide: id },
    })
  } catch (error) {
    console.error(`Repository - Error fetching slide with id ${id}:`, error)
    throw error
  }
}

export const findByTitle = async (
  title: string
): Promise<HeroCarouselSlide | null> => {
  try {
    return await prisma.heroCarouselSlide.findFirst({
      where: { title: title.trim() },
    })
  } catch (error) {
    console.error(
      `Repository - Error fetching slide with title ${title}:`,
      error
    )
    throw error
  }
}

export const create = async (
  data: HeroCarouselFormValues
): Promise<HeroCarouselSlide> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérification si une diapositive avec le même titre existe déjà
      const existingSlideByTitle = await findByTitle(data.title.trim())

      if (existingSlideByTitle) {
        throw new Error("Une diapositive avec ce titre existe déjà.")
      }

      return await tx.heroCarouselSlide.create({
        data: {
          title: data.title.trim(),
          description: data.description?.trim() || "",
          button_text: data.button_text?.trim() || "",
          button_link: data.button_link?.trim() || "",
          priority_order: data.priority_order,
          image_url: data.image_url ?? "",
          active: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
      })
    })
  } catch (error) {
    console.error("Repository - Error creating slide:", error)
    throw error
  }
}

export const update = async (
  id: number,
  data: HeroCarouselFormValues
): Promise<HeroCarouselSlide> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérification si une diapositive avec l'ID existe
      const slideExists = await tx.heroCarouselSlide.findUnique({
        where: { id_hero_slide: id },
      })
      if (!slideExists) {
        throw new Error(`La diapositive avec l'ID ${id} n'existe pas`)
      }

      console.log("Data to update REPO:", { ...data, id })

      const updateData = {
        title: data.title.trim(),
        description: data.description?.trim() || "",
        button_text: data.button_text?.trim() || "",
        button_link: data.button_link?.trim() || "",
        priority_order: data.priority_order,
        image_url: data.image_url ?? "",
        active: data.active ?? true,
        updated_at: new Date(),
      }

      return await tx.heroCarouselSlide.update({
        where: { id_hero_slide: id },
        data: updateData,
      })
    })
  } catch (error) {
    console.error(`Repository - Error updating slide with id ${id}:`, error)
    throw error
  }
}

// Ajout d'une méthode pour les mises à jour partielles
export const updatePartial = async (
  id: number,
  data: Partial<HeroCarouselFormValues>
): Promise<HeroCarouselSlide> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérification si une diapositive avec l'ID existe
      const slideExists = await tx.heroCarouselSlide.findUnique({
        where: { id_hero_slide: id },
      })

      if (!slideExists) {
        throw new Error(`La diapositive avec l'ID ${id} n'existe pas`)
      }

      console.log("Partial data to update REPO:", { ...data, id })

      // Création d'un objet qui ne contiendra que les champs à mettre à jour
      const updateData: Partial<HeroCarouselSlide> = {
        updated_at: new Date(),
      }

      // Ajout conditionnel des champs présents dans data
      if (data.title !== undefined) {
        updateData.title = data.title.trim()
      }

      if (data.description !== undefined) {
        updateData.description = data.description?.trim() || ""
      }

      if (data.button_text !== undefined) {
        updateData.button_text = data.button_text?.trim() || ""
      }

      if (data.button_link !== undefined) {
        updateData.button_link = data.button_link?.trim() || ""
      }

      if (data.priority_order !== undefined) {
        updateData.priority_order = data.priority_order
      }

      if (data.image_url !== undefined) {
        updateData.image_url = data.image_url || ""
      }

      if (data.active !== undefined) {
        updateData.active = data.active
      }

      console.log("Final partial update data:", updateData)

      return await tx.heroCarouselSlide.update({
        where: { id_hero_slide: id },
        data: updateData,
      })
    })
  } catch (error) {
    console.error(
      `Repository - Error partially updating slide with id ${id}:`,
      error
    )
    throw error
  }
}

export const remove = async (id: number): Promise<HeroCarouselSlide> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérification si une diapositive avec l'ID existe
      const slideExists = await tx.heroCarouselSlide.findUnique({
        where: { id_hero_slide: id },
      })
      if (!slideExists) {
        throw new Error(`La diapositive avec l'ID ${id} n'existe pas`)
      }

      return tx.heroCarouselSlide.delete({
        where: { id_hero_slide: id },
      })
    })
  } catch (error) {
    console.error(`Repository - Error deleting slide with id ${id}:`, error)
    throw error
  }
}

export const exists = async (id: number): Promise<boolean> => {
  try {
    const slide = await prisma.heroCarouselSlide.findUnique({
      where: { id_hero_slide: id },
    })

    return slide !== null
  } catch (error) {
    console.error("Impossible de vérifier l'existence de la slide:", error)
    throw error
  }
}

const heroCarouselRepository = {
  findAll,
  findById,
  findByTitle,
  create,
  update,
  updatePartial,
  remove,
  exists,
}

export default heroCarouselRepository
