"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/lib/chat-store";

export function ChatInput() {
  const { sendMessage, state } = useChat();
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const currentRoom = state.rooms.find(room => room.id === state.currentRoomId);

  return (
    <div className="border-t bg-background p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${currentRoom?.name || 'general'}`}
            className="min-h-[40px] max-h-[120px] resize-none pr-12"
            rows={1}
          />
          <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
            {message.length > 0 && `${message.length}/2000`}
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={!message.trim() || message.length > 2000}
          className="self-end"
        >
          Send
        </Button>
      </form>
      <div className="text-xs text-muted-foreground mt-2">
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send, 
        <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-1">Shift + Enter</kbd> for new line
      </div>
    </div>
  );
}