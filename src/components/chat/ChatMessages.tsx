"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/chat-store";
import { Message } from "./Message";

export function ChatMessages() {
  const { state } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Filter messages for current room
  const currentMessages = state.messages
    .filter(message => message.roomId === state.currentRoomId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const currentRoom = state.rooms.find(room => room.id === state.currentRoomId);

  if (currentMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div className="max-w-md">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-semibold mb-2">
            Welcome to #{currentRoom?.name}
          </h3>
          <p className="text-muted-foreground">
            {currentRoom?.description}. Start a conversation by sending the first message!
          </p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = currentMessages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof currentMessages>);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    if (dateString === today) {
      return "Today";
    } else if (dateString === yesterdayString) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="space-y-1">
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center py-4">
              <div className="flex-1 border-t" />
              <div className="px-4 text-xs text-muted-foreground font-medium">
                {formatDateHeader(date)}
              </div>
              <div className="flex-1 border-t" />
            </div>
            
            {/* Messages for this date */}
            {(messages as typeof currentMessages).map((message) => (
              <Message
                key={message.id}
                message={message}
                isOwn={message.userId === state.currentUser.id}
              />
            ))}
          </div>
        ))}
        
        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}