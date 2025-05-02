import { Skeleton } from "@/components/ui/skeleton"

export function DailySalesChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Axe y avec graduations */}
      <div className="flex flex-1">
        <div className="w-12 flex flex-col justify-between py-4">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 w-10" />
        </div>

        {/* Barres du graphique */}
        <div className="flex-1 flex items-end gap-4 px-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-2">
              <Skeleton
                className={`w-full h-${Math.floor(Math.random() * 40 + 20)}  rounded-t-sm`}
              />
              <Skeleton className="h-4 w-8 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Légende */}
      <div className="flex justify-center mt-8">
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
  )
}

export function PieChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Graphique en camembert */}
      <div className="flex-1 flex justify-center items-center">
        <div className="relative">
          <Skeleton className="h-40 w-40 rounded-full" />
          <Skeleton className="h-24 w-24 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background" />
        </div>
      </div>

      {/* Tableau récapitulatif */}
      <div className="mt-3 border rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-3 border-t">
            <div className="flex justify-between">
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 rounded-full mr-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
        <div className="bg-gray-50 p-3 border-t">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function AverageCartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Axes */}
      <div className="flex flex-1">
        {/* Axe Y (catégories) */}
        <div className="w-28 flex flex-col justify-around py-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-20 ml-2" />
          ))}
        </div>

        {/* Barres horizontales */}
        <div className="flex-1 flex flex-col justify-around gap-4 py-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-1 h-6">
              <Skeleton
                className={`w-${Math.floor(Math.random() * 20 + 20)}% h-full rounded-r-sm`}
              />
              <Skeleton
                className={`w-${Math.floor(Math.random() * 15 + 10)}% h-full rounded-sm`}
              />
              <Skeleton
                className={`w-${Math.floor(Math.random() * 10 + 5)}% h-full rounded-sm`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Légende */}
      <div className="flex justify-center gap-4 mt-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-4 w-4 rounded-full mr-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
