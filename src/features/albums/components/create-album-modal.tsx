import React, { useEffect, useState } from 'react';
import { Dialog, DialogBody, DialogFooter, DialogHeader, TextField, Button } from '@/shared/components/ui';

interface CreateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Nhận tên album đã trim; success/failure do caller xử lý (toast + đóng modal). */
  onSubmit: (name: string) => Promise<void>;
}

/** Modal tạo album mới. */
function CreateAlbumModal({ isOpen, onClose, onSubmit }: CreateAlbumModalProps) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(name);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} titleId="create-album-title" size="sm">
      <form onSubmit={handleSubmit}>
        <DialogHeader titleId="create-album-title" title="Tạo album" onClose={onClose} />
        <DialogBody>
          <TextField
            id="new-album-name"
            name="album-name"
            variant="boxed"
            label="Tên album"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Phim Mafia Ý…"
          />
        </DialogBody>
        <DialogFooter>
          <Button type="submit" disabled={submitting || !name.trim()} className="w-full">
            {submitting ? 'Đang tạo…' : 'Tạo album'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

export default CreateAlbumModal;
