import { useState } from 'react';
import { Music, Playlist, AppView } from './types';

import Header from './components/Header';
import CartSidebar from './components/CartSidebar';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { useAuth } from './hooks/useAuth';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { ProfilePage } from './pages/ProfilePage';
import { NoticesPage } from './pages/NoticesPage';

function App() {
  const { user, authView, setAuthView, handleLoginSuccess, handleLogout } = useAuth();
  const [view, setView] = useState<AppView>('search');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Music[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [cart, setCart] = useState<Music[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const toggleCart = (song: Music) => {
    setCart(prev =>
      prev.some(c => c.spotify_url === song.spotify_url)
        ? prev.filter(c => c.spotify_url !== song.spotify_url)
        : [...prev, song]
    );
  };

  // 🔐 로그인 / 회원가입 화면
  if (!user) {
    return (
      <>
        {authView === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setAuthView('register')}
          />
        )}
        {authView === 'register' && (
          <Register
            onRegisterSuccess={() => setAuthView('login')}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </>
    );
  }

  // ✅ 메인 레이아웃
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* 사이드바 (고정) */}
      <Sidebar
        view={view}
        onViewChange={setView}
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSettings={() => {}}
        onLogout={handleLogout}
      />

      {/* 메인 영역 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header viewTitle={view} user={user} />

        {/* 🔥 이 영역만 스크롤 */}
        <div className="flex-1 overflow-y-auto p-8">
          {view === 'search' && (
            <SearchPage
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              searchResults={searchResults}
              setSearchResults={setSearchResults}
              cart={cart}
              onToggleCart={toggleCart}
            />
          )}

          {view === 'library' && (
            <LibraryPage
              playlists={playlists}
              onNavigateToSearch={() => setView('search')}
            />
          )}

          {view === 'profile' && (
            <ProfilePage user={user} playlists={playlists} />
          )}

          {view === 'notices' && <NoticesPage />}
        </div>

        {/* 장바구니 사이드바 */}
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onRemove={(url) =>
            setCart(cart.filter(m => m.spotify_url !== url))
          }
          onClear={() => setCart([])}
          onSavePlaylist={(title, desc) => {
            const newP: Playlist = {
              playlist_no: Date.now(),
              user_no: user.user_no,
              title,
              content: desc,
              created_at: '',
              updated_at: '',
              music_items: cart
            };

            setPlaylists([newP, ...playlists]);
            setCart([]);
            setIsCartOpen(false);
            setView('library');
          }}
        />
      </main>
    </div>
  );
}

export default App;
