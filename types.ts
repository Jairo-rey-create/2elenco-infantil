export interface User {
  id: string;
  name: string;
  avatar: string;
  coverPhoto?: string;
}

export type MediaType = 'image' | 'video' | 'none';

export type Language = 'en' | 'es';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface Comment {
  id: string;
  author: User;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  author: User;
  timestamp: number;
  title?: string;
  content: string;
  mediaType: MediaType;
  mediaUrl?: string;
  mediaMimeType?: string; 
  reactions: { [key in ReactionType]?: number };
  userReaction?: ReactionType;
  comments: Comment[];
  tags: string[];
}

export interface AppSettings {
  backgroundImage?: string;
  publicUrl?: string; // Nuevo campo para el enlace público real
}

export interface AIState {
  isLoading: boolean;
  error: string | null;
}