import React, { useEffect, useState } from 'react';
import { X, FolderPlus, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie, Album } from '../../types';
import { subscribeToAlbums } from '../../services/albumService';
import { useAuth } from '../providers/AuthProvider';
import useToastStore from '../../stores/toastStore';
import { updateAlbum, addAlbum } from '../../services/albumService';
import { getDisplayTitle } from '../../utils/movieUtils';
import Loading from '../ui/Loading';
import EmptyState from '../ui/EmptyState';
import logoText from '../../assets/images/logo_text.png';
import { MESSAGES, MODAL_VARIANTS, OVERLAY_VARIANTS } from '../../constants';
import { usePreventScroll } from '../../hooks/usePreventScroll';

interface AlbumSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

const AlbumSelectorModal: React.FC<AlbumSelectorModalProps> = ({ isOpen, onClose, movie }) => {
  const { user } = useAuth();
  const { showToast } = useToastStore();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToAlbum, setAddingToAlbum] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);

  // Prevent body scroll when modal is open
  usePreventScroll(isOpen);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToAlbums(user.uid, data => {
      setAlbums(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddToAlbum = async (album: Album) => {
    if (!album.docId || !movie?.docId) return;
    if (!user) return;

    // Check if movie is already in this album
    if (album.movieDocIds.includes(movie.docId)) {
      showToast(MESSAGES.ALBUM.ALREADY_IN, 'info');
      return;
    }

    // Check if movie is watched (can only add watched movies to albums)
    if ((movie.status || 'history') !== 'history') {
      showToast(MESSAGES.ALBUM.ONLY_WATCHED, 'error');
      return;
    }

    try {
      setAddingToAlbum(album.docId);
      const newIds = Array.from(new Set([...(album.movieDocIds || []), movie.docId]));
      await updateAlbum(album.docId, { movieDocIds: newIds });
      showToast(MESSAGES.ALBUM.ADD_MOVIE_SUCCESS, 'success');
    } catch (error) {
      showToast(MESSAGES.ALBUM.ADD_MOVIE_ERROR, 'error');
    } finally {
      setAddingToAlbum(null);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim() || !user) return;

    try {
      setCreatingAlbum(true);
      await addAlbum({
        uid: user.uid,
        name: newAlbumName.trim(),
        movieDocIds: [],
      });
      showToast(MESSAGES.ALBUM.CREATE_SUCCESS(newAlbumName), 'success');
      setNewAlbumName('');
      setShowCreateForm(false);
    } catch (error) {
      showToast(MESSAGES.ALBUM.CREATE_ERROR, 'error');
    } finally {
      setCreatingAlbum(false);
    }
  };

  const availableAlbums = albums.filter(album =>
    album.movieDocIds && !album.movieDocIds.includes(movie?.docId || '')
  );

  return (
    <AnimatePresence>
      {isOpen && movie && (
        <motion.div
          variants={OVERLAY_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            variants={MODAL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface w-full max-w-xl rounded-4xl overflow-hidden shadow-premium border border-border-default relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-border-default rounded-xl text-text-muted hover:text-text-main transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="p-8 border-b border-border-default bg-surface/50 backdrop-blur-md">
              <div className="flex items-center gap-5">
                <div className="w-16 h-24 rounded-2xl overflow-hidden shadow-lg border border-border-default shrink-0">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : logoText}
                    alt={getDisplayTitle(movie)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1 block">Thêm vào Album</span>
                  <h2 className="text-2xl font-bold text-text-main truncate tracking-tight">{getDisplayTitle(movie)}</h2>
                  <p className="text-sm text-text-muted mt-1 opacity-80">Lưu giữ phim vào danh sách yêu thích của bạn</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {showCreateForm ? (
                <div className="mb-8 p-6 border border-primary/20 rounded-2xl bg-primary/5 animate-in fade-in slide-in-from-top-2">
                  <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Tạo album mới</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nhập tên album..."
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateAlbum()}
                      className="w-full h-11 px-5 rounded-2xl border border-border-default bg-surface text-text-main font-bold placeholder-text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-sm"
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleCreateAlbum}
                        disabled={creatingAlbum || !newAlbumName.trim()}
                        className="flex-1 px-6 py-3.5 bg-primary text-white rounded-2xl font-bold hover:shadow-premium disabled:opacity-40 transition-all shadow-lg shadow-primary/20"
                      >
                        {creatingAlbum ? 'Đang xử lý...' : 'Tạo album'}
                      </button>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="px-6 py-3.5 border border-border-default text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl font-bold transition-all"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full p-6 mb-6 rounded-3xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-110 transition-transform">
                      <FolderPlus size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-primary text-lg">Tạo bộ sưu tập mới</h3>
                      <p className="text-sm text-text-muted opacity-70">Phân loại phim theo sở thích riêng</p>
                    </div>
                  </div>
                </button>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loading size={40} fullScreen={false} />
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest animate-pulse">Đang tải album...</p>
                </div>
              ) : availableAlbums.length === 0 ? (
                <EmptyState
                  icon={FolderPlus}
                  title="Trống trải quá"
                  description={albums.length === 0
                    ? 'Bạn chưa có album nào. Hãy tạo cái đầu tiên để bắt đầu lưu trữ!'
                    : 'Phim này đã có mặt trong tất cả các album hiện có của bạn.'
                  }
                  className="py-10"
                />
              ) : (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-60">Chọn Album</h3>
                  {availableAlbums.map(album => (
                    <button
                      key={album.docId}
                      onClick={() => handleAddToAlbum(album)}
                      disabled={addingToAlbum === album.docId}
                      className="w-full p-5 rounded-3xl border border-border-default hover:border-primary/50 hover:bg-primary/5 hover:shadow-premium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-border-default group-hover:border-primary/30 group-hover:bg-primary/10 transition-all">
                          <Film size={22} className="text-text-muted group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-text-main group-hover:text-primary transition-colors text-lg truncate">
                            {album.name}
                          </h3>
                          <p className="text-sm text-text-muted font-medium">
                            {album.movieDocIds.length} phim trong bộ sưu tập
                          </p>
                        </div>
                        <div className="text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          {addingToAlbum === album.docId ? 'Đang xử lý...' : 'Chọn ngay'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlbumSelectorModal;