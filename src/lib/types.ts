export interface User {
  id: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  lastActivity: Date;
  type: 'general' | 'random' | 'help' | 'announcements';
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  reactions: Reaction[];
  type: 'text' | 'system';
}

export interface ChatState {
  currentUser: User;
  users: User[];
  rooms: ChatRoom[];
  messages: ChatMessage[];
  currentRoomId: string;
  isLoading: boolean;
}

export interface ChatContextType {
  state: ChatState;
  sendMessage: (content: string) => void;
  switchRoom: (roomId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  updateUserStatus: (status: User['status']) => void;
}