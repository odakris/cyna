import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Cyna from "../public/cyna.png";
import Logo from "../public/logo.jpeg";

const HeroCarousel = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <Carousel opts={{ loop: true }}>
        <CarouselContent className="snap-mandatory">
          <CarouselItem className="snap-start">
            <div className="relative w-full h-64"> {/* Taille ajustable */}
              <Image src={Cyna} alt="Image 1" fill className="object-cover" />
            </div>
          </CarouselItem>
          <CarouselItem className="snap-start">
            <div className="relative w-full h-64">
              <Image src={Logo} alt="Image 2" fill className="object-cover" />
            </div>
          </CarouselItem>
          <CarouselItem className="snap-start">
            <div className="relative w-full h-64">
              <Image src={Cyna} alt="Image 3" fill className="object-cover" />
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full" />
        <CarouselNext className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full" />
      </Carousel>
    </div>
  );
};

export default HeroCarousel;
