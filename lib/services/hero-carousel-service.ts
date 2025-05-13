import { HeroCarouselSlide } from "@prisma/client"
import { HeroCarouselFormValues } from "@/lib/validations/hero-carousel-schema"
import heroCarouselRepository from "@/lib/repositories/hero-carousel-repository"

// Service pour gérer la logique métier des opérations sur le HeroCarouselSlide
export const getAllSlides = async (): Promise<HeroCarouselSlide[]> => {
  try {
    return await heroCarouselRepository.findAll()
  } catch (error) {
    // console.error("Service - Error getting all slides:", error)
    throw error
  }
}

export const getSlideById = async (
  id: number
): Promise<HeroCarouselSlide | null> => {
  try {
    return await heroCarouselRepository.findById(id)
  } catch (error) {
    // console.error(`Service - Error getting slide with id ${id}:`, error)
    throw error
  }
}

export const createSlide = async (
  data: HeroCarouselFormValues
): Promise<HeroCarouselSlide> => {
  try {
    return await heroCarouselRepository.create(data)
  } catch (error) {
    // console.error("Service - Error creating slide:", error)
    throw error
  }
}

export const updateSlide = async (
  id: number,
  data: HeroCarouselFormValues
): Promise<HeroCarouselSlide> => {
  try {
    const existingSlide = await heroCarouselRepository.findById(id)
    if (!existingSlide) {
      throw new Error(`Slide avec l'ID ${id} non trouvé`)
    }

    console.log("Data to update SERVICE:", data)
    return await heroCarouselRepository.update(id, data)
  } catch (error) {
    // console.error(`Service - Error updating slide with id ${id}:`, error)
    throw error
  }
}

// Ajout de la méthode pour les mises à jour partielles (pour PATCH)
export const updatePartialSlide = async (
  id: number,
  partialData: Partial<HeroCarouselFormValues>
): Promise<HeroCarouselSlide> => {
  try {
    const existingSlide = await heroCarouselRepository.findById(id)
    if (!existingSlide) {
      throw new Error(`Slide avec l'ID ${id} non trouvé`)
    }

    // Pour une mise à jour partielle, nous fusionnons les données existantes avec les nouvelles
    const fullData = {
      ...existingSlide,
      ...partialData,
    } as HeroCarouselFormValues

    console.log("Data to partial update SERVICE:", partialData)
    console.log("Full data after merge:", fullData)

    // Pour les mises à jour partielles, nous utilisons une méthode spécifique du repository
    return await heroCarouselRepository.updatePartial(id, partialData)
  } catch (error) {
    /*console.error(
      `Service - Error partially updating slide with id ${id}:`,
      error
    )*/
    throw error
  }
}

export const deleteSlide = async (id: number): Promise<HeroCarouselSlide> => {
  try {
    const slide = await heroCarouselRepository.findById(id)
    if (!slide) {
      throw new Error(`Slide avec l'ID ${id} non trouvé`)
    }

    // Supprimer le slide
    return await heroCarouselRepository.remove(id)
  } catch (error) {
    // console.error(`Service - Error deleting slide with id ${id}:`, error)
    throw error
  }
}

const heroCarouselService = {
  getAllSlides,
  getSlideById,
  createSlide,
  updateSlide,
  updatePartialSlide,
  deleteSlide,
}

export default heroCarouselService
