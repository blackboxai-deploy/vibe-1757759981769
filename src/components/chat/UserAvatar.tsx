"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const statusColors = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  busy: "bg-red-500",
  offline: "bg-gray-400",
};

const statusLabels = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline",
};

export function UserAvatar({ 
  user, 
  size = "md", 
  showStatus = true, 
  className 
}: UserAvatarProps) {
  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("relative", className)}>
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarImage src={user.avatar} alt={user.username} />
        <AvatarFallback className="text-xs font-medium">
          {getInitials(user.username)}
        </AvatarFallback>
      </Avatar>
      
      {showStatus && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <div
            className={cn(
              "w-3 h-3 rounded-full border-2 border-background",
              statusColors[user.status]
            )}
            title={statusLabels[user.status]}
          />
        </div>
      )}
    </div>
  );
}