// frontend/App.tsx
import React, { useState, useEffect } from 'react';
import {
  Home, Library, Search as SearchIcon, User as UserIcon, LogOut,
  Settings, Bell, Plus, Play, Pause, Music as MusicIcon,
  Search, Loader2, Heart, Check, Clock, Edit3, Trash2
} from 'lucide-react';

import { Music, Playlist, AppView, User } from './types';

import {
  searchMusic,
  getAllMusic,
  getTop50Music
} from './services/musicService';

import {
  getUserPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addMusicToPlaylist,
  removeMusicFromPlaylist,
  getPlaylistMusic
} from './services/playlistService';

import {
  login,
  register,
  logout as logoutApi,
  getToken,
  verifyToken
} from './services/authService';

import {
  getUserProfile,
  updateUserProfile,
  deleteAccount
} from './services/userService';

import { MOCK_NOTICES, MOCK_STATS } from './constants';

import Header from './components/Header';
import PlaylistCard from './components/PlaylistCard';
import SettingsModal from './components/SettingsModal';
import ProfileEditModal from './components/ProfileEditModal';
import CartSidebar from './components/CartSidebar';
import PlaylistDetail from './components/PlaylistDetail';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import { GenreDistribution, WeeklyActivity, AudioRadar } from './components/Charts';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { NoticesPage } from './pages/NoticesPage';

type AuthView = 'login' | 'register' | null;

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [view, setView] = useState<AppView>('home');

  const [songs, setSongs] = useState<Music[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistCount, setPlaylistCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Music[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [cart, setCart] = useState<Music[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  const [currentSong, setCurrentSong] = useState<Music | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 🔐 자동 로그인
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        const res = await verifyToken(token);
        if (res.success && res.data) {
          const nickname = localStorage.getItem('nickname') || 'User';
          const userNo = Number(localStorage.getItem('user_no'));
          setUser({
            user_no: userNo,
            role_no: res.data.role_no,
            email: '',
            nickname,
            profile_url: null,
            created_at: new Date().toISOString()
          });
          setAuthView(null);
          fetchPlaylists(userNo);
        }
      }
      setIsAuthChecking(false);
    };
    checkAuth();
  }, []);

  const fetchPlaylists = async (userNo: number) => {
    setIsLoading(true);
    try {
      const res = await getUserPlaylists(userNo);
      if (res.success && res.data) {
        const withMusic = await Promise.all(
          res.data.map(async (p: Playlist) => {
            const m = await getPlaylistMusic(p.playlist_no);
            return { ...p, music_items: m.data?.music_list || [] };
          })
        );
        setPlaylists(withMusic);
        setPlaylistCount(withMusic.length);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return authView === 'login'
      ? <Login onLoginSuccess={() => setAuthView(null)} onSwitchToRegister={() => setAuthView('register')} />
      : <Register onRegisterSuccess={() => setAuthView('login')} onSwitchToLogin={() => setAuthView('login')} />;
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      {/* ... (이하 구조는 upstream 그대로 유지) */}
      <NoticesPage />
    </div>
  );
}

export default App;
