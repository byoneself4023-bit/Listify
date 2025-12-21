import { API_URL } from '../constants';
import { Music } from '../types';
import { getToken } from './authService';

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

// Helper function for authenticated requests
const authFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
};

// 백엔드 /music/search API - Spotify 검색 + DB 저장 + music_no 반환
export const searchMusic = async (keyword: string): Promise<ApiResponse<Music[]>> => {
    try {
        const response = await authFetch(`/music/search?q=${encodeURIComponent(keyword)}`);
        return await response.json();
    } catch (error) {
        console.error('음악 검색 오류:', error);
        return { success: false, message: '음악 검색에 실패했습니다.' };
    }
};

// 백엔드 /music API - DB에 저장된 전체 음악 목록
export const getAllMusic = async (): Promise<ApiResponse<Music[]>> => {
    try {
        const response = await authFetch('/music');
        return await response.json();
    } catch (error) {
        console.error('음악 목록 조회 오류:', error);
        return { success: false, message: '음악 목록을 불러올 수 없습니다.' };
    }
};

// 백엔드 /music/top50 API - Spotify Top 50 + DB 저장
export const getTop50Music = async (): Promise<ApiResponse<Music[]>> => {
    try {
        const response = await authFetch('/music/top50');
        return await response.json();
    } catch (error) {
        console.error('Top 50 조회 오류:', error);
        return { success: false, message: 'Top 50을 불러올 수 없습니다.' };
    }
};
