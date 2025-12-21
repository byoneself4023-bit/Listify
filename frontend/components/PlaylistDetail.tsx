import React from 'react';
import { X, Trash2, Clock, Music as MusicIcon, Calendar, Edit3 } from 'lucide-react';
import { Playlist, Music } from '../types';

interface PlaylistDetailProps {
    playlist: Playlist | null;
    isOpen: boolean;
    onClose: () => void;
    onRemoveMusic: (musicNo: number) => void;
    onDeletePlaylist: () => void;
    onEdit: () => void;
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({
    playlist,
    isOpen,
    onClose,
    onRemoveMusic,
    onDeletePlaylist,
    onEdit
}) => {
    if (!playlist) return null;

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // music_items가 배열인지 확인
    const musicItems = Array.isArray(playlist.music_items) ? playlist.music_items : [];

    const totalDuration = musicItems.reduce((sum, m) => sum + (m.duration_ms || 0), 0);
    const totalMinutes = Math.floor(totalDuration / 60000);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    // 콜라주 이미지 생성 (최대 4개)
    const coverImages = musicItems.slice(0, 4).map(m => m.album_image_url);

    return (
        <div
            className={`fixed top-0 right-0 h-full w-96 bg-zinc-950 border-l border-zinc-800 transform transition-transform duration-300 z-50 shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
        >
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                <h2 className="text-xl font-bold truncate flex-1">{playlist.title}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Cover & Info */}
            <div className="p-6 border-b border-zinc-800">
                {/* Cover Collage */}
                <div className="aspect-square mb-4 rounded-xl overflow-hidden bg-zinc-900">
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
                            <MusicIcon className="w-16 h-16 text-zinc-700" />
                        </div>
                    )}
                </div>

                {/* Description */}
                {playlist.content && (
                    <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{playlist.content}</p>
                )}

                {/* Stats */}
                <div className="flex gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1.5">
                        <MusicIcon className="w-4 h-4" />
                        {musicItems.length}곡
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {totalMinutes}분
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(playlist.created_at)}
                    </span>
                </div>
            </div>

            {/* Track List */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-2">
                    {musicItems.length > 0 ? (
                        musicItems.map((track, idx) => (
                            <div
                                key={track.music_no || idx}
                                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 transition-colors"
                            >
                                <span className="w-6 text-center text-sm text-zinc-600">{idx + 1}</span>
                                <img
                                    src={track.album_image_url}
                                    alt={track.track_name}
                                    className="w-10 h-10 rounded object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{track.track_name}</p>
                                    <p className="text-xs text-zinc-500 truncate">{track.artist_name}</p>
                                </div>
                                <span className="text-xs text-zinc-600 mr-2">
                                    {formatDuration(track.duration_ms)}
                                </span>
                                {track.music_no && (
                                    <button
                                        onClick={() => onRemoveMusic(track.music_no!)}
                                        className="p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-zinc-600">
                            <MusicIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p>수록곡이 없습니다</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                <button
                    onClick={onDeletePlaylist}
                    className="w-full py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    플레이리스트 삭제
                </button>
            </div>
        </div>
    );
};

export default PlaylistDetail;
