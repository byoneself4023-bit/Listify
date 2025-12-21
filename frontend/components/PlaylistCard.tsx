
import React from 'react';
import { Play, MoreVertical, Music as MusicIcon, Calendar } from 'lucide-react';
import { Playlist } from '../types';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: (p: Playlist) => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  // 콜라주 이미지 생성 (최대 4개) - music_items가 배열인지 확인
  const musicItems = Array.isArray(playlist.music_items) ? playlist.music_items : [];
  const coverImages = musicItems.slice(0, 4).map(m => m.album_image_url);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div
      onClick={() => onClick(playlist)}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 group hover:bg-zinc-800 transition-all cursor-pointer hover:border-zinc-600"
    >
      <div className="relative aspect-square mb-4 bg-zinc-950 rounded-lg overflow-hidden">
        {/* Cover Collage */}
        {coverImages.length >= 4 ? (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
            {coverImages.map((url, i) => (
              <img key={i} src={url} alt="" className="w-full h-full object-cover" />
            ))}
          </div>
        ) : coverImages.length > 0 ? (
          <img src={coverImages[0]} alt={playlist.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MusicIcon className="w-12 h-12 text-zinc-700" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-black text-black ml-1" />
          </div>
        </div>
      </div>

      <h4 className="font-bold truncate text-white">{playlist.title}</h4>
      <p className="text-sm text-zinc-400 line-clamp-1 mt-1">{playlist.content || '설명 없음'}</p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <MusicIcon className="w-3 h-3" />
            {musicItems.length}곡
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(playlist.created_at)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // More options menu would go here
          }}
          className="text-zinc-500 hover:text-white p-1 rounded transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PlaylistCard;
