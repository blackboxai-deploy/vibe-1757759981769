"use client";

import { useState } from "react";
import { ChatMessage } from "@/lib/types";
import { UserAvatar } from "./UserAvatar";
import { useChat } from "@/lib/chat-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageProps {
  message: ChatMessage;
  isOwn?: boolean;
}

const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];

export function Message({ message, isOwn = false }: MessageProps) {
  const { addReaction, removeReaction, state } = useChat();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: Date) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleReaction = (emoji: string) => {
    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    const userHasReacted = existingReaction?.userIds.includes(state.currentUser.id);

    if (userHasReacted) {
      removeReaction(message.id, emoji);
    } else {
      addReaction(message.id, emoji);
    }
    setShowEmojiPicker(false);
  };

  const user = state.users.find(u => u.id === message.userId);

  return (
    <div className={cn(
      "group flex gap-3 px-4 py-2 hover:bg-muted/50 relative",
      isOwn && "flex-row-reverse"
    )}>
      <UserAvatar 
        user={user || state.currentUser} 
        size="sm" 
        className="flex-shrink-0 mt-0.5"
      />
      
      <div className={cn("flex-1 min-w-0", isOwn && "text-right")}>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "font-medium text-sm",
            isOwn && "order-2"
          )}>
            {message.username}
          </span>
          <span className={cn(
            "text-xs text-muted-foreground",
            isOwn && "order-1"
          )}>
            {formatDate(message.timestamp)} at {formatTime(message.timestamp)}
          </span>
        </div>
        
        <div className={cn(
          "relative max-w-lg",
          isOwn && "ml-auto"
        )}>
          <div className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isOwn 
              ? "bg-primary text-primary-foreground ml-auto" 
              : "bg-muted"
          )}>
            {message.content}
          </div>
          
          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction) => {
                const userHasReacted = reaction.userIds.includes(state.currentUser.id);
                return (
                  <Button
                    key={reaction.emoji}
                    variant={userHasReacted ? "default" : "outline"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleReaction(reaction.emoji)}
                  >
                    {reaction.emoji} {reaction.count}
                  </Button>
                );
              })}
            </div>
          )}
          
          {/* Emoji picker trigger */}
          <div className={cn(
            "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
            isOwn ? "-left-8" : "-right-8"
          )}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😊
            </Button>
          </div>
          
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className={cn(
              "absolute top-8 z-10 bg-background border rounded-lg shadow-lg p-2",
              isOwn ? "right-0" : "left-0"
            )}>
              <div className="grid grid-cols-4 gap-1">
                {commonEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => handleReaction(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}