import HeroCarouselFormPage from "@/components/Admin/HeroCarousel/Form/HeroCarouselFormPage"
import { validateId } from "@/lib/utils/utils"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Modifier le slide | CYNA Backoffice",
  description: "Modifier le slide du carousel d'accueil",
}

export default async function EditHeroCarouselSlidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid slide ID")
  }
  return <HeroCarouselFormPage slideId={id.toString()} />
}
