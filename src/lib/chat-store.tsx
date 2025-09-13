"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ChatState, ChatContextType, ChatMessage, ChatRoom, User } from './types';

// Mock data
const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'You',
    avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/fadf4b23-cd75-4f45-a3c5-e6ff37d643e0.png',
    isOnline: true,
    status: 'online',
    lastSeen: new Date(),
  },
  {
    id: 'user-2',
    username: 'Alice',
    avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/2da9ced6-4e5d-47bc-8a81-2a32af895630.png',
    isOnline: true,
    status: 'online',
    lastSeen: new Date(),
  },
  {
    id: 'user-3',
    username: 'Bob',
    avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/72fff811-53d5-4f79-a2d2-28f894ba2899.png',
    isOnline: true,
    status: 'away',
    lastSeen: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: 'user-4',
    username: 'Charlie',
    avatar: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a7c3c97c-414b-489c-8734-bddcd1ec6d2d.png',
    isOnline: false,
    status: 'offline',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

const mockRooms: ChatRoom[] = [
  {
    id: 'general',
    name: 'general',
    description: 'General discussion',
    memberCount: 4,
    lastActivity: new Date(),
    type: 'general',
  },
  {
    id: 'random',
    name: 'random',
    description: 'Random conversations',
    memberCount: 3,
    lastActivity: new Date(Date.now() - 30 * 60 * 1000),
    type: 'random',
  },
  {
    id: 'help',
    name: 'help',
    description: 'Get help from the community',
    memberCount: 2,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'help',
  },
  {
    id: 'announcements',
    name: 'announcements',
    description: 'Important announcements',
    memberCount: 4,
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: 'announcements',
  },
];

const mockMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    roomId: 'general',
    userId: 'user-2',
    username: 'Alice',
    content: 'Hey everyone! How\'s your day going?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reactions: [
      { emoji: '👋', count: 2, userIds: ['user-1', 'user-3'] },
    ],
    type: 'text',
  },
  {
    id: 'msg-2',
    roomId: 'general',
    userId: 'user-3',
    username: 'Bob',
    content: 'Pretty good! Working on some exciting projects.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
    reactions: [],
    type: 'text',
  },
  {
    id: 'msg-3',
    roomId: 'general',
    userId: 'user-1',
    username: 'You',
    content: 'Same here! Love the new chat interface.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000),
    reactions: [
      { emoji: '❤️', count: 1, userIds: ['user-2'] },
    ],
    type: 'text',
  },
];

const initialState: ChatState = {
  currentUser: mockUsers[0],
  users: mockUsers,
  rooms: mockRooms,
  messages: mockMessages,
  currentRoomId: 'general',
  isLoading: false,
};

type ChatAction =
  | { type: 'SEND_MESSAGE'; payload: { content: string } }
  | { type: 'SWITCH_ROOM'; payload: { roomId: string } }
  | { type: 'ADD_REACTION'; payload: { messageId: string; emoji: string } }
  | { type: 'REMOVE_REACTION'; payload: { messageId: string; emoji: string } }
  | { type: 'UPDATE_USER_STATUS'; payload: { status: User['status'] } }
  | { type: 'ADD_AUTO_MESSAGE'; payload: { message: ChatMessage } }
  | { type: 'LOAD_FROM_STORAGE'; payload: { state: Partial<ChatState> } };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SEND_MESSAGE': {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        roomId: state.currentRoomId,
        userId: state.currentUser.id,
        username: state.currentUser.username,
        content: action.payload.content,
        timestamp: new Date(),
        reactions: [],
        type: 'text',
      };

      const updatedMessages = [...state.messages, newMessage];
      
      // Update room last activity
      const updatedRooms = state.rooms.map(room =>
        room.id === state.currentRoomId
          ? { ...room, lastActivity: new Date() }
          : room
      );

      const newState = {
        ...state,
        messages: updatedMessages,
        rooms: updatedRooms,
      };

      // Save to localStorage
      localStorage.setItem('chat-messages', JSON.stringify(updatedMessages));
      return newState;
    }

    case 'SWITCH_ROOM':
      return {
        ...state,
        currentRoomId: action.payload.roomId,
      };

    case 'ADD_REACTION': {
      const updatedMessages = state.messages.map(message => {
        if (message.id === action.payload.messageId) {
          const existingReaction = message.reactions.find(r => r.emoji === action.payload.emoji);
          
          if (existingReaction) {
            // Add user to existing reaction
            if (!existingReaction.userIds.includes(state.currentUser.id)) {
              return {
                ...message,
                reactions: message.reactions.map(r =>
                  r.emoji === action.payload.emoji
                    ? { ...r, count: r.count + 1, userIds: [...r.userIds, state.currentUser.id] }
                    : r
                ),
              };
            }
          } else {
            // Add new reaction
            return {
              ...message,
              reactions: [
                ...message.reactions,
                { emoji: action.payload.emoji, count: 1, userIds: [state.currentUser.id] },
              ],
            };
          }
        }
        return message;
      });

      localStorage.setItem('chat-messages', JSON.stringify(updatedMessages));
      return { ...state, messages: updatedMessages };
    }

    case 'REMOVE_REACTION': {
      const updatedMessages = state.messages.map(message => {
        if (message.id === action.payload.messageId) {
          return {
            ...message,
            reactions: message.reactions
              .map(r =>
                r.emoji === action.payload.emoji
                  ? { ...r, count: r.count - 1, userIds: r.userIds.filter(id => id !== state.currentUser.id) }
                  : r
              )
              .filter(r => r.count > 0),
          };
        }
        return message;
      });

      localStorage.setItem('chat-messages', JSON.stringify(updatedMessages));
      return { ...state, messages: updatedMessages };
    }

    case 'UPDATE_USER_STATUS':
      return {
        ...state,
        currentUser: { ...state.currentUser, status: action.payload.status },
      };

    case 'ADD_AUTO_MESSAGE':
      const updatedMessages = [...state.messages, action.payload.message];
      localStorage.setItem('chat-messages', JSON.stringify(updatedMessages));
      return {
        ...state,
        messages: updatedMessages,
      };

    case 'LOAD_FROM_STORAGE':
      return { ...state, ...action.payload.state };

    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-messages');
    if (savedMessages) {
      try {
        const messages: ChatMessage[] = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: { state: { messages } } });
      } catch (error) {
        console.error('Failed to load messages from localStorage:', error);
      }
    }
  }, []);

  // Auto-generate responses simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly generate messages from other users
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        const otherUsers = state.users.filter(user => user.id !== state.currentUser.id && user.isOnline);
        if (otherUsers.length > 0) {
          const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
          const responses = [
            "That's interesting!",
            "I agree with that point.",
            "Has anyone tried the new features?",
            "Great discussion everyone!",
            "I'm working on something similar.",
            "Thanks for sharing!",
            "Looking forward to hearing more about this.",
          ];
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          const autoMessage: ChatMessage = {
            id: `auto-msg-${Date.now()}-${Math.random()}`,
            roomId: state.currentRoomId,
            userId: randomUser.id,
            username: randomUser.username,
            content: randomResponse,
            timestamp: new Date(),
            reactions: [],
            type: 'text',
          };

          dispatch({ type: 'ADD_AUTO_MESSAGE', payload: { message: autoMessage } });
        }
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [state.currentRoomId, state.currentUser.id, state.users]);

  const sendMessage = (content: string) => {
    dispatch({ type: 'SEND_MESSAGE', payload: { content } });
  };

  const switchRoom = (roomId: string) => {
    dispatch({ type: 'SWITCH_ROOM', payload: { roomId } });
  };

  const addReaction = (messageId: string, emoji: string) => {
    dispatch({ type: 'ADD_REACTION', payload: { messageId, emoji } });
  };

  const removeReaction = (messageId: string, emoji: string) => {
    dispatch({ type: 'REMOVE_REACTION', payload: { messageId, emoji } });
  };

  const updateUserStatus = (status: User['status']) => {
    dispatch({ type: 'UPDATE_USER_STATUS', payload: { status } });
  };

  const contextValue: ChatContextType = {
    state,
    sendMessage,
    switchRoom,
    addReaction,
    removeReaction,
    updateUserStatus,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}