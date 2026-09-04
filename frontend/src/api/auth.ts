import { apiClient } from './client';
import { AuthResponse, User } from '../types';

export async function getDemoUsers(): Promise<User[]> {
  return apiClient<User[]>('/auth/users');
}

export async function loginUser(payload: { user_id?: number; email?: string }): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<User> {
  return apiClient<User>('/auth/me');
}
