export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Document {
  id: number;
  title: string;
  content: any;
  owner_id: number;
  owner?: User;
  user_permission?: 'owner' | 'editor' | 'viewer' | string;
  created_at: string;
  updated_at: string;
}

export interface SharedDocumentItem {
  id: number;
  title: string;
  content: any;
  owner_id: number;
  owner?: User;
  permission: 'editor' | 'viewer' | string;
  created_at: string;
  updated_at: string;
  shared_at: string;
}

export interface DocumentListResponse {
  my_documents: Document[];
  shared_with_me: SharedDocumentItem[];
}

export interface ShareRequest {
  target_user_id: number;
  permission: 'editor' | 'viewer';
}

export interface ShareResponse {
  id: number;
  document_id: number;
  user_id: number;
  user?: User;
  permission: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}
