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
    <div className="flex flex-col justify-center items-center bg-muted/30 rounded-lg p-8">
      <Avatar className="h-36 w-36 mb-4 border-4 border-background shadow-lg">
        <AvatarImage
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name}%20${user.last_name}&backgroundColor=4f46e5`}
          alt={`${user.first_name} ${user.last_name}`}
        />
        <AvatarFallback className="text-2xl font-bold">
          {getUserInitials(user.first_name ?? "", user.last_name ?? "")}
        </AvatarFallback>
      </Avatar>
      <h2 className="text-xl font-bold mt-4">
        {user.first_name} {user.last_name}
      </h2>
      <p className="text-muted-foreground">{user.email}</p>
      <Badge className={`px-3 py-1 mt-3 ${getRoleBadgeColor(user.role)}`}>
        {user.role}
      </Badge>
    </div>
  )
}
