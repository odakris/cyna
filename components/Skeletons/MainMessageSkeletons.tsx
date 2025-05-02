import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import React from "react"

export function MainMessageListSkeleton() {
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array(3)
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
          <Skeleton className="h-10 w-full sm:w-80 rounded-md" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Skeleton className="h-10 w-full sm:w-80" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <div className="rounded-md border">
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

export function MainMessageDetailSkeleton() {
  return (
    <div className="mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-48 mb-2" />
          </div>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
          <Skeleton className="h-px w-full" /> {/* Separator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-[100px_1fr] gap-2">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <React.Fragment key={i}>
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-full" />
                    </React.Fragment>
                  ))}
              </div>
            </div>

            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-[150px_1fr] gap-2">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <React.Fragment key={i}>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-full" />
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </div>
          <Skeleton className="h-px w-full" /> {/* Separator */}
          <div>
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function MainMessageFormSkeleton() {
  return (
    <div className="mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Première colonne */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-48 mb-2" />
              </div>
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              <Skeleton className="h-20 w-full rounded-md" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 p-4 border rounded-lg">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-end">
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
              </div>

              <div className="space-y-2 p-4 border rounded-lg">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-end">
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deuxième colonne */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-24 mb-2" />
              </div>
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-px w-full" /> {/* Separator */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
