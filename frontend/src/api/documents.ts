import { apiClient } from './client';
import {
  Document,
  DocumentListResponse,
  ShareRequest,
  ShareResponse,
} from '../types';

export async function getDocuments(): Promise<DocumentListResponse> {
  return apiClient<DocumentListResponse>('/documents');
}

export async function getDocument(id: number): Promise<Document> {
  return apiClient<Document>(`/documents/${id}`);
}

export async function createDocument(payload: {
  title?: string;
  content?: any;
}): Promise<Document> {
  return apiClient<Document>('/documents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDocument(
  id: number,
  payload: { title?: string; content?: any }
): Promise<Document> {
  return apiClient<Document>(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteDocument(id: number): Promise<void> {
  return apiClient<void>(`/documents/${id}`, {
    method: 'DELETE',
  });
}

export async function importDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<Document>('/documents/import', {
    method: 'POST',
    body: formData,
  });
}

export async function shareDocument(
  id: number,
  payload: ShareRequest
): Promise<ShareResponse> {
  return apiClient<ShareResponse>(`/documents/${id}/share`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listDocumentShares(id: number): Promise<ShareResponse[]> {
  return apiClient<ShareResponse[]>(`/documents/${id}/shares`);
}

export async function revokeDocumentShare(
  documentId: number,
  targetUserId: number
): Promise<void> {
  return apiClient<void>(`/documents/${documentId}/share/${targetUserId}`, {
    method: 'DELETE',
  });
}

