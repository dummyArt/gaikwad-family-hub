export type UserRole = 'super_admin' | 'admin' | 'member';
export type MemberStatus = 'approved' | 'pending' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: MemberStatus;
  phone?: string;
  relationship?: string;
  relationshipHindi?: string;
  birthday?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
  bio?: string;
}

export type MediaType = 'photo' | 'video' | 'audio' | 'document';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  url: string;
  originalUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileHash?: string;
  folderId: string;
  folderName: string;
  uploaderId: string;
  uploaderName: string;
  uploadDate: string;
  eventName?: string;
  dateTaken?: string;
  tags: string[];
  likes: string[]; // user IDs
  comments: Comment[];
  isFavorite: boolean;
  duration?: number; // in seconds for audio/video
  width?: number;
  height?: number;
}

export interface AlbumFolder {
  id: string;
  name: string;
  hindiName: string;
  iconName: string;
  description: string;
  coverImage?: string;
  itemCount: number;
  isDefault?: boolean;
  createdAt: string;
}

export interface InviteLink {
  id: string;
  token: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  expiresAt: string;
  isRevoked: boolean;
  usesRemaining?: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  actionHindi: string;
  details: string;
  timestamp: string;
}

export interface StorageMetrics {
  totalBytes: number;
  photoCount: number;
  photoBytes: number;
  videoCount: number;
  videoBytes: number;
  audioCount: number;
  audioBytes: number;
  memberCount: number;
  albumCount: number;
}
