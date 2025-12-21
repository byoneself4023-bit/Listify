// frontend/services/musicService.ts
import { API_URL } from '../constants';
import { Music } from '../types';
import { getToken } from './authService';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const authFetch = async (endpoint: string): Promise<ApiResponse<any>> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, { headers });
  return res.json();
};

export const searchMusic = (q: string) =>
  authFetch(`/music/search?q=${encodeURIComponent(q)}`);

export const getAllMusic = () =>
  authFetch('/music');

export const getTop50Music = () =>
  authFetch('/music/top50');
