"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useChat } from "@/lib/chat-store";

interface ChatHeaderProps {
  onOpenSidebar?: () => void;
}

export function ChatHeader({ onOpenSidebar }: ChatHeaderProps) {
  const { state } = useChat();
  
  const currentRoom = state.rooms.find(room => room.id === state.currentRoomId);
  const onlineUsers = state.users.filter(user => user.isOnline).length;

  if (!currentRoom) return null;

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onOpenSidebar}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
              fill="currentColor"
            />
          </svg>
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-muted-foreground">#</span>
          <h1 className="text-lg font-semibold">{currentRoom.name}</h1>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm text-muted-foreground">|</span>
          <span className="text-sm text-muted-foreground">
            {currentRoom.description}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="hidden sm:flex">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
          {onlineUsers} online
        </Badge>
        
        <Badge variant="outline">
          {currentRoom.memberCount} members
        </Badge>
      </div>
    </div>
  );
}