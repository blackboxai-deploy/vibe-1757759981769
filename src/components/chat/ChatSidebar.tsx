"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useChat } from "@/lib/chat-store";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  className?: string;
}

export function ChatSidebar({ className }: ChatSidebarProps) {
  const { state, switchRoom, updateUserStatus } = useChat();
  const [showAllUsers, setShowAllUsers] = useState(false);

  const sortedRooms = [...state.rooms].sort((a, b) => {
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });

  const onlineUsers = state.users.filter(user => user.isOnline);
  const offlineUsers = state.users.filter(user => !user.isOnline);
  const displayUsers = showAllUsers ? state.users : onlineUsers;

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "now";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'general': return '💬';
      case 'random': return '🎲';
      case 'help': return '❓';
      case 'announcements': return '📢';
      default: return '#';
    }
  };

  return (
    <div className={cn("flex flex-col w-60 bg-muted/30 border-r", className)}>
      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <UserAvatar user={state.currentUser} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{state.currentUser.username}</p>
            <Select
              value={state.currentUser.status}
              onValueChange={(value) => updateUserStatus(value as any)}
            >
              <SelectTrigger className="w-full h-6 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">🟢 Online</SelectItem>
                <SelectItem value="away">🟡 Away</SelectItem>
                <SelectItem value="busy">🔴 Busy</SelectItem>
                <SelectItem value="offline">⚫ Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Chat Rooms */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Channels
          </h2>
          <ScrollArea className="space-y-1">
            {sortedRooms.map((room) => {
              const isActive = room.id === state.currentRoomId;
              const hasNewActivity = new Date(room.lastActivity) > new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
              
              return (
                <Button
                  key={room.id}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left h-auto py-2 px-2",
                    isActive && "bg-primary/10 text-primary"
                  )}
                  onClick={() => switchRoom(room.id)}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-base flex-shrink-0">
                      {getRoomIcon(room.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {room.name}
                        </span>
                        {hasNewActivity && !isActive && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {room.memberCount} members • {formatLastActivity(room.lastActivity)}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </ScrollArea>
        </div>

        <Separator />

        {/* Online Users */}
        <div className="p-3 flex-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {showAllUsers ? `Members — ${state.users.length}` : `Online — ${onlineUsers.length}`}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-xs"
              onClick={() => setShowAllUsers(!showAllUsers)}
            >
              {showAllUsers ? '👁️' : '👥'}
            </Button>
          </div>
          
          <ScrollArea className="space-y-2">
            {displayUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50"
              >
                <UserAvatar user={user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.username}
                    {user.id === state.currentUser.id && " (you)"}
                  </p>
                  {!user.isOnline && (
                    <p className="text-xs text-muted-foreground">
                      Last seen {formatLastActivity(user.lastSeen)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>

          {!showAllUsers && offlineUsers.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-xs text-muted-foreground"
              onClick={() => setShowAllUsers(true)}
            >
              Show {offlineUsers.length} offline members
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}