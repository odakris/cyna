import { Separator } from "@/components/ui/separator"

export function Message() {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-center text-primary">
          Message très très important sur les promotions et actualités
        </h1>
      </div>
      <Separator className="my-4" />
    </div>
  )
}
