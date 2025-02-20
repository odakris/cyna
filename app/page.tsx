import { CarouselPlugin } from "../components/Carousel/CarouselPlugin"
import { Message } from "../components/Message/Message"

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-[100%]">
      <CarouselPlugin />
      <Message />
    </div>
  )
}
