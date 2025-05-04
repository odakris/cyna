import { User } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface UserProfileProps {
  user: User
  getUserInitials: (firstName: string, lastName: string) => string
  getRoleBadgeColor: (role: string) => string
}

export default function UserProfile({
  user,
  getUserInitials,
  getRoleBadgeColor,
}: UserProfileProps) {
  return (
    <div className="flex flex-col justify-center items-center bg-muted/30 rounded-lg p-4 sm:p-8">
      <Avatar className="h-24 sm:h-36 w-24 sm:w-36 mb-3 sm:mb-4 border-4 border-background shadow-lg">
        <AvatarImage
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name}%20${user.last_name}&backgroundColor=4f46e5`}
          alt={`${user.first_name} ${user.last_name}`}
        />
        <AvatarFallback className="text-xl sm:text-2xl font-bold">
          {getUserInitials(user.first_name ?? "", user.last_name ?? "")}
        </AvatarFallback>
      </Avatar>
      <h2 className="text-lg sm:text-xl font-bold mt-2 sm:mt-4">
        {user.first_name} {user.last_name}
      </h2>
      <p className="text-sm text-muted-foreground break-all text-center">
        {user.email}
      </p>
      <Badge
        className={`px-2 sm:px-3 py-0.5 sm:py-1 mt-2 sm:mt-3 text-xs sm:text-sm ${getRoleBadgeColor(user.role)}`}
      >
        {user.role}
      </Badge>
    </div>
  )
}
