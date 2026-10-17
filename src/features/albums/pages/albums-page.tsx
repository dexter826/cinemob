import LoadingStatus from '@/shared/components/ui/loading-status';
import Skeleton from '@/shared/components/ui/skeleton';
import ErrorState from '@/shared/components/ui/error-state';
import React, { useRef, useState } from 'react';
import { Plus, Folder } from 'lucide-react';
import { useAuth } from '@/features/auth/components/auth-provider';
import { Album } from '@/types';
import { addAlbum, deleteAlbum } from '../services/album-service';
import useToastStore from '@/shared/stores/toast-store';
import { Button, PageHeader } from '@/shared/components/ui';
import useAlertStore from '@/shared/stores/alert-store';
import useAlbumStore from '../stores/album-store';
import { MESSAGES } from '@/constants/messages';
import EmptyState from '@/shared/components/ui/empty-state';
import Pagination from '@/shared/components/ui/pagination';
import CreateAlbumModal from '../components/create-album-modal';
import AlbumCard from '../components/album-card';

const ALBUMS_PER_PAGE = 12;

/** Quản lý và hiển thị danh sách các album phim cá nhân — lưới thẻ chồng poster. */
function AlbumsPage() {
  const { user } = useAuth();
  const { showToast } = useToastStore();
  const { showAlert } = useAlertStore();
  const { albums, loading, error, retry, albumCoverMovies } = useAlbumStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const creatingRef = useRef(false);

  const totalPages = Math.ceil(albums.length / ALBUMS_PER_PAGE);
  // Xóa hết album ở trang cuối → kẹp về trang lớn nhất còn tồn tại.
  const safePage = Math.min(currentPage, totalPages || 1);
  const paginatedAlbums = albums.slice(
    (safePage - 1) * ALBUMS_PER_PAGE,
    safePage * ALBUMS_PER_PAGE,
  );

  const handleCreate = async (name: string) => {
    if (!user) return;
    // Ref-guard chống double-submit trong cùng một tick render.
    if (creatingRef.current || !name.trim()) return;
    creatingRef.current = true;
    try {
      await addAlbum({
        uid: user.uid,
        name: name.trim(),
        movieDocIds: [],
      });
      showToast(MESSAGES.ALBUM.CREATE_SUCCESS(name.trim()), 'success');
      setIsCreateOpen(false);
    } catch {
      showToast(MESSAGES.ALBUM.CREATE_ERROR, 'error');
    } finally {
      creatingRef.current = false;
    }
  };

  const handleDelete = (album: Album) => {
    if (!album.docId) return;
    showAlert({
      title: 'Xóa album',
      message:
        'Bạn có chắc chắn muốn xóa album này? Hành động này không xóa phim đã xem, chỉ xóa album.',
      type: 'danger',
      confirmText: 'Xóa',
      onConfirm: async () => {
        try {
          await deleteAlbum(album.docId!);
          showToast(MESSAGES.ALBUM.DELETE_SUCCESS, 'success');
        } catch {
          showToast(MESSAGES.ALBUM.DELETE_ERROR, 'error');
        }
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
      <PageHeader
        title="Album phim"
        actions={
          <Button
            onClick={() => setIsCreateOpen(true)}
            leadingIcon={<Plus size={14} strokeWidth={1.5} aria-hidden="true" />}
          >
            Tạo album
          </Button>
        }
      />

      <LoadingStatus>{loading ? 'Đang tải album…' : ''}</LoadingStatus>
      {error ? (
        <ErrorState
          title={error}
          description="Vui lòng thử tải lại album."
          retry={{ label: 'Thử lại', onClick: retry }}
        />
      ) : loading ? (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-2/3 rounded-poster  " />
          ))}
        </div>
      ) : albums.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Folder}
            title="Chưa có album nào"
            description="Tạo album đầu tiên rồi thêm phim đã xem vào."
            action={{ label: 'Tạo album', onClick: () => setIsCreateOpen(true) }}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
          {paginatedAlbums.map((album, index) => {
            const coverPosters: (string | null)[] =
              (album.docId ? albumCoverMovies[album.docId] : undefined)?.map(
                (movie) => movie.poster_path,
              ) ?? [];

            return (
              <AlbumCard
                key={album.docId}
                album={album}
                coverPosters={coverPosters}
                onDelete={handleDelete}
                index={index}
              />
            );
          })}
        </div>
      )}

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <CreateAlbumModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

export default AlbumsPage;
