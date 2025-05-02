import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// User Form Skeleton
export const UserFormSkeleton = () => {
  return (
    <div className="mx-auto p-6 space-y-6">
      <Skeleton className="h-10 w-1/3" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  )
}

// User Details Skeleton
export const UserDetailSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-1/3" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-2/5" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <Skeleton className="h-64 w-64 mx-auto rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  )
}

// Users Home Page Skeleton
export const UsersHomeSkeleton = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-1/3" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>

      <div className="flex justify-between items-center py-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {Array(7)
                  .fill(0)
                  .map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-8 w-full" />
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    {Array(7)
                      .fill(0)
                      .map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-16 w-full" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}
