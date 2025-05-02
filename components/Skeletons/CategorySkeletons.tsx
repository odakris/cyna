import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function CategoryDetailsSkeleton() {
  return (
    <div className="mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-1/4 mb-2" />
              </div>
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-[300px] w-full rounded-lg" />
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne d'informations */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-1/2 mb-2" />
              </div>
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-full" />
              </div>
              <Skeleton className="h-px w-full" /> {/* Separator */}
              <div>
                <Skeleton className="h-4 w-36 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <Skeleton className="h-px w-full" /> {/* Separator */}
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-px w-full" /> {/* Separator */}
              <div>
                <Skeleton className="h-4 w-40 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function CategoryFormSkeleton() {
  return (
    <div className="mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale avec le formulaire */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Tabs */}
              <div className="w-full">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-48 mb-2" />
                  </div>
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>

                  <div className="flex justify-between border-t pt-6">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Colonne d'aperçu */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-6 w-48 mb-2" />
                </div>
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="aspect-video w-full rounded-lg" />

                <div className="space-y-3">
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                  <Skeleton className="h-px w-full" /> {/* Separator */}
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                  <Skeleton className="h-px w-full" /> {/* Separator */}
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-4" />
                  </div>
                </div>

                <div className="pt-4">
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CategoryListSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-10 w-full sm:w-64 rounded-md" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Skeleton className="h-10 w-full sm:w-80" />
            <div className="flex gap-2 w-full sm:w-auto">
              <Skeleton className="h-10 w-44" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="bg-muted/50 p-3">
              <div className="grid grid-cols-5 gap-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
              </div>
            </div>

            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border-t p-4">
                  <div className="grid grid-cols-5 gap-4">
                    {Array(5)
                      .fill(0)
                      .map((_, j) => (
                        <Skeleton key={j} className="h-10 w-full" />
                      ))}
                  </div>
                </div>
              ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-4 mt-4">
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-5 w-32" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
