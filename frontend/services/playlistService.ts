import { API_URL } from '../constants';
import { Music, Playlist } from '../types';
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

// 사용자 플레이리스트 목록 조회
export const getUserPlaylists = async (userNo: number): Promise<ApiResponse<Playlist[]>> => {
  try {
    const response = await authFetch(`/playlist/user/${userNo}`);
    return await response.json();
  } catch (error) {
    console.error('플레이리스트 목록 조회 오류:', error);
    return { success: false, message: '플레이리스트 목록을 불러올 수 없습니다.' };
  }
};

// 플레이리스트 상세 조회
export const getPlaylistDetail = async (playlistNo: number): Promise<ApiResponse<Playlist>> => {
  try {
    const response = await authFetch(`/playlist/${playlistNo}`);
    return await response.json();
  } catch (error) {
    console.error('플레이리스트 상세 조회 오류:', error);
    return { success: false, message: '플레이리스트를 불러올 수 없습니다.' };
  }
};

// 플레이리스트 생성
export const createPlaylist = async (title: string, content?: string): Promise<ApiResponse<{ playlist_no: number }>> => {
  try {
    const response = await authFetch('/playlist', {
      method: 'POST',
      body: JSON.stringify({ title, content })
    });
    return await response.json();
  } catch (error) {
    console.error('플레이리스트 생성 오류:', error);
    return { success: false, message: '플레이리스트 생성에 실패했습니다.' };
  }
};

// 플레이리스트 수정
export const updatePlaylist = async (playlistNo: number, title: string, content?: string): Promise<ApiResponse<null>> => {
  try {
    const response = await authFetch(`/playlist/${playlistNo}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content })
    });
    return await response.json();
  } catch (error) {
    console.error('플레이리스트 수정 오류:', error);
    return { success: false, message: '플레이리스트 수정에 실패했습니다.' };
  }
};

// 플레이리스트 삭제
export const deletePlaylist = async (playlistNo: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authFetch(`/playlist/${playlistNo}`, {
      method: 'DELETE'
    });
    return await response.json();
  } catch (error) {
    console.error('플레이리스트 삭제 오류:', error);
    return { success: false, message: '플레이리스트 삭제에 실패했습니다.' };
  }
};

// 플레이리스트에 곡 추가 (music_no 필수 - DB에 저장된 곡만 추가 가능)
export const addMusicToPlaylist = async (playlistNo: number, musicNo: number): Promise<ApiResponse<{ playlist_no: number; music_no: number }>> => {
  try {
    const response = await authFetch(`/playlist/${playlistNo}/music`, {
      method: 'POST',
      body: JSON.stringify({ music_no: musicNo })
    });
    return await response.json();
  } catch (error) {
    console.error('곡 추가 오류:', error);
    return { success: false, message: '곡 추가에 실패했습니다.' };
  }
};

// 플레이리스트에서 곡 삭제
export const removeMusicFromPlaylist = async (playlistNo: number, musicNo: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authFetch(`/playlist/${playlistNo}/music/${musicNo}`, {
      method: 'DELETE'
    });
    return await response.json();
  } catch (error) {
    console.error('곡 삭제 오류:', error);
    return { success: false, message: '곡 삭제에 실패했습니다.' };
  }
};

// 플레이리스트의 음악 목록 조회
export const getPlaylistMusic = async (playlistNo: number): Promise<ApiResponse<Music[]>> => {
  try {
    const response = await authFetch(`/playlist/${playlistNo}/music`);
    return await response.json();
  } catch (error) {
    console.error('음악 목록 조회 오류:', error);
    return { success: false, message: '음악 목록을 불러올 수 없습니다.' };
  }
};
