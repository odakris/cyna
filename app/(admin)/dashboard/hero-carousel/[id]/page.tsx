import HeroCarouselDetailPage from "@/components/Admin/HeroCarousel/Details/HeroCarouselDetailPage"
import { validateId } from "@/lib/utils/utils"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Détails du slide | CYNA Backoffice",
  description: "Détails du slide du carousel d'accueil",
}

export default async function SlideDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid slide ID")
  }

  return <HeroCarouselDetailPage id={id.toString()} />
}
