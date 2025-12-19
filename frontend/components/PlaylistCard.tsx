
import React from 'react';
import { Play, MoreVertical, Music as MusicIcon } from 'lucide-react';
import { Playlist } from '../types';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: (p: Playlist) => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  return (
    <div 
      onClick={() => onClick(playlist)}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 group hover:bg-zinc-800 transition-all cursor-pointer hover:border-zinc-600"
    >
      <div className="relative aspect-square mb-4 bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center">
        {playlist.music_items && playlist.music_items.length > 0 ? (
          <img src={playlist.music_items[0].album_image_url} alt={playlist.title} className="w-full h-full object-cover" />
        ) : (
          <MusicIcon className="w-12 h-12 text-zinc-700" />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 fill-black text-black ml-1" />
          </div>
        </div>
      </div>
      <h4 className="font-bold truncate text-white">{playlist.title}</h4>
      <p className="text-sm text-zinc-400 line-clamp-1">{playlist.content || '설명 없음'}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
        <span className="text-xs text-zinc-500">{playlist.music_items?.length || 0} 곡</span>
        <button className="text-zinc-500 hover:text-white">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PlaylistCard;
