import { Metadata } from "next"
import RoleGuard from "@/components/Auth/RoleGuard"
import { Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"
import HeroCarouselPage from "@/components/Admin/HeroCarousel/HeroCarouselPage"

export const metadata: Metadata = {
  title: "Gestion du Hero Carousel | CYNA Backoffice",
  description: "Interface de gestion des slides du carousel d'accueil",
}

export default function HeroCarouselHomePage() {
  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission d'accéder à cette page." />
      }
    >
      <HeroCarouselPage />
    </RoleGuard>
  )
}
