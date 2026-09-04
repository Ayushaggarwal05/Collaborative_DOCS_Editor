import { apiClient } from './client';
import { User } from '../types';

export async function getAllUsers(): Promise<User[]> {
  return apiClient<User[]>('/users');
}
