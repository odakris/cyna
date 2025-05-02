import HeroCarouselFormPage from "@/components/Admin/HeroCarousel/Form/HeroCarouselFormPage"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ajouter un slide | CYNA Backoffice",
  description: "Ajouter un slide au carousel d'accueil",
}

export default function NewHeroCarouselSlidePage() {
  return <HeroCarouselFormPage />
}
