import { useRef, useState } from 'react';
import { deleteAlbum } from '../services/album-service';
import useToastStore from '@/shared/stores/toast-store';
import { MESSAGES } from '@/constants/messages';
import { Album } from '@/types';

const UNDO_DELETE_MS = 7000;

/**
 * Xoá album theo cơ chế hoàn tác 7 giây dùng chung cho mọi trang:
 * ẩn album ngay, hết 7 giây mới xoá thật; hoàn tác huỷ timer và hiện lại.
 */
export function useDeleteAlbum() {
  const { showToast } = useToastStore();
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  const deleteTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const hideAlbum = (docId: string) => {
    setPendingDeleteIds((prev) => new Set(prev).add(docId));
  };

  const handleDelete = (album: Album) => {
    const docId = album.docId;
    if (!docId || deleteTimersRef.current.has(docId)) return;

    hideAlbum(docId);
    const timer = setTimeout(async () => {
      deleteTimersRef.current.delete(docId);
      try {
        await deleteAlbum(docId);
      } catch {
        setPendingDeleteIds((prev) => {
          const next = new Set(prev);
          next.delete(docId);
          return next;
        });
        showToast(MESSAGES.ALBUM.DELETE_ERROR, 'error');
      }
    }, UNDO_DELETE_MS);
    deleteTimersRef.current.set(docId, timer);

    showToast(MESSAGES.ALBUM.DELETE_SUCCESS, 'info', UNDO_DELETE_MS, {
      label: MESSAGES.MOVIE.UNDO,
      onAction: () => {
        const pendingTimer = deleteTimersRef.current.get(docId);
        if (pendingTimer) {
          clearTimeout(pendingTimer);
          deleteTimersRef.current.delete(docId);
        }
        setPendingDeleteIds((prev) => {
          const next = new Set(prev);
          next.delete(docId);
          return next;
        });
      },
    });
  };

  return { pendingDeleteIds, handleDelete };
}
