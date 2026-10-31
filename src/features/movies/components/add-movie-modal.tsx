import LoadingStatus from '@/shared/components/ui/loading-status';
import Skeleton from '@/shared/components/ui/skeleton';
import ErrorState from '@/shared/components/ui/error-state';
import Chip from '@/shared/components/ui/chip';
import { useDelayedSkeleton } from '@/shared/hooks/use-delayed-skeleton';
import { useEffect, useRef, useState } from 'react';

import { X, Save, Type, Image, MessageSquare, Calendar, Clock, Pencil, Eye } from 'lucide-react';

import { Dialog, DialogBody } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { IconButton } from '@/shared/components/ui/icon-button';
import useAlertStore from '@/shared/stores/alert-store';

import StatusToggle from './add-movie/status-toggle';
import RatingSection from './add-movie/rating-section';
import TVProgressSection from './add-movie/tv-progress-section';
import AlbumSection from './add-movie/album-section';
import MovieFormFields from './add-movie/movie-form-fields';
import PosterPreview from './add-movie/poster-preview';
import DatePicker from '@/shared/components/ui/date-picker';
import TimePicker from '@/shared/components/ui/time-picker';
import Switch from '@/shared/components/ui/switch';

import { useAddMovieForm } from '../hooks/use-add-movie-form';
import { COUNTRY_OPTIONS } from '@/constants';
import { GENRE_TRANSLATIONS } from '@/constants/genres';
import { formatDateDMY } from '@/shared/utils/date-format';

function AddMovieModal({ onExited }: { onExited?: () => void }) {
  const {
    isOpen,
    initialData,
    closeAddModal,
    formData,
    setFormData,
    status,
    setStatus,
    manualMediaType,
    setManualMediaType,
    isDirty,
    isSubmitting,
    isLoadingDetails,
    detailsError,
    retryDetails,
    tvProgressLoading,
    tvProgressError,
    retryTVProgress,
    canSubmit,
    movieExists,
    ratingError,
    setRatingError,
    hoverRating,
    setHoverRating,
    isAnimating,
    currentSeason,
    setCurrentSeason,
    currentEpisode,
    setCurrentEpisode,
    isCompleted,
    setIsCompleted,
    seasonDates,
    setSeasonDate,
    resolvedSeasonCount,
    totalEpisodes,
    episodesPerSeason,
    selectedAlbumIds,
    setSelectedAlbumIds,
    showCreateAlbum,
    setShowCreateAlbum,
    newAlbumName,
    setNewAlbumName,
    creatingAlbum,
    handleCreateAlbum,
    handleSubmit,
    genreOptions,
    selectedGenreIds,
    setSelectedGenreIds,
    isManualMode,
    isTVSeries,
    refs,
    errors,
    albums,
    albumsLoading,
    albumsError,
    retryAlbums,
  } = useAddMovieForm();

  // Cột trái mặc định là tóm tắt thông tin; nút swap sang form chỉnh sửa.
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const editInfoButtonRef = useRef<HTMLButtonElement>(null);
  const { showAlert } = useAlertStore();
  const showSkeleton = useDelayedSkeleton(isLoadingDetails);

  // Đóng→mở nhanh trong window exit animation có thể không unmount kịp → luôn mở lại ở tóm tắt.
  useEffect(() => {
    if (isOpen) setIsEditingInfo(false);
  }, [isOpen]);

  useEffect(() => {
    if (
      !isManualMode &&
      (errors.title || errors.country || errors.releaseDate || errors.runtime || errors.seasons)
    ) {
      setIsEditingInfo(true);
    }
  }, [errors, isManualMode]);

  const isEditMode = !!initialData?.movieToEdit;
  const submitDisabled =
    !canSubmit || isSubmitting || (movieExists && !isEditMode) || (isEditMode && !isDirty);

  // Chặn đóng modal khi form còn thay đổi chưa lưu.
  const requestClose = () => {
    if (isDirty && !isSubmitting) {
      showAlert({
        title: 'Bỏ thay đổi?',
        message: 'Thay đổi chưa lưu sẽ mất nếu bạn đóng hộp thoại này.',
        type: 'warning',
        confirmText: 'Bỏ thay đổi',
        onConfirm: closeAddModal,
      });
      return;
    }
    closeAddModal();
  };

  // Swap panel và trả focus vào trong dialog (cả hai nút tự unmount nên activeElement rơi ra <body>).
  const swapToEditInfo = () => {
    setIsEditingInfo(true);
    setTimeout(() => refs.title.current?.focus(), 0);
  };
  const swapToSummary = () => {
    setIsEditingInfo(false);
    setTimeout(() => editInfoButtonRef.current?.focus(), 0);
  };

  // Các field thông tin dùng chung cho panel chỉnh sửa (TMDB) và thêm thủ công.
  const infoFormFields = (
    <>
      <div className="space-y-2">
        <label
          htmlFor="add-movie-title-input"
          className="text-label-caps text-text-primary flex items-center gap-2 ml-1"
        >
          <Type size={14} strokeWidth={1.5} className="text-primary" aria-hidden="true" />
          Tiêu đề gốc
        </label>
        <input
          id="add-movie-title-input"
          name="movie-title"
          ref={refs.title}
          type="text"
          required
          autoComplete="off"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? 'add-movie-title-error' : undefined}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full h-11 border border-border rounded-card px-4 text-body font-bold text-text-primary focus-visible:border-primary/50 focus-ring transition-colors disabled:opacity-50 ${isAnimating && errors.title ? 'border-danger/50' : ''}`}
          placeholder="Nhập tên gốc của phim…"
        />
        {isAnimating && errors.title && (
          <p
            id="add-movie-title-error"
            role="alert"
            className="text-body-sm font-medium text-danger ml-1"
          >
            Nhập tên phim để lưu lại trong thư viện.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor="add-movie-title-vi"
          className="text-label-caps text-text-primary flex items-center gap-2 ml-1"
        >
          <Type size={14} strokeWidth={1.5} className="text-primary" aria-hidden="true" />
          Tiêu đề tiếng Việt
        </label>
        <input
          id="add-movie-title-vi"
          name="movie-title-vi"
          type="text"
          autoComplete="off"
          value={formData.title_vi}
          onChange={(e) => setFormData({ ...formData, title_vi: e.target.value })}
          className="w-full h-11 border border-border rounded-card px-4 text-body font-bold text-text-primary focus-visible:border-primary/50 focus-ring transition-colors disabled:opacity-50"
          placeholder="Nhập tên tiếng Việt…"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="add-movie-poster"
          className="text-label-caps text-text-primary flex items-center gap-2 ml-1"
        >
          <Image size={14} strokeWidth={1.5} className="text-primary" aria-hidden="true" />
          URL ảnh poster
        </label>
        <input
          id="add-movie-poster"
          name="movie-poster"
          type="text"
          inputMode="url"
          autoComplete="off"
          value={formData.poster}
          onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
          className="w-full h-11 border border-border rounded-card px-4 text-body font-medium text-text-primary focus-visible:border-primary/50 focus-ring transition-colors"
          placeholder="https://…"
        />
      </div>
      <MovieFormFields
        isManualMode={isManualMode}
        manualMediaType={manualMediaType}
        setManualMediaType={setManualMediaType}
        formData={formData}
        setFormData={setFormData}
        isTVSeries={isTVSeries}
        countryOptions={COUNTRY_OPTIONS}
        genreOptions={genreOptions}
        selectedGenreIds={selectedGenreIds}
        setSelectedGenreIds={setSelectedGenreIds}
        isAnimating={isAnimating}
        errors={errors}
        refs={refs}
      />
    </>
  );

  const genreNames = formData.genres
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);

  const summaryMeta = [
    { label: 'Quốc gia', value: formData.country },
    {
      label: 'Ngày phát hành',
      value: formData.releaseDate ? formatDateDMY(formData.releaseDate) : '',
    },
    {
      label: isTVSeries ? 'Số mùa' : 'Thời lượng',
      value: isTVSeries
        ? parseInt(formData.seasons, 10) > 0
          ? `${formData.seasons} mùa`
          : ''
        : parseInt(formData.runtime, 10) > 0
          ? `${formData.runtime} phút`
          : '',
    },
  ].filter((row) => row.value);

  return (
    <Dialog
      open={isOpen}
      onClose={requestClose}
      titleId="add-movie-title"
      presentation="fullscreen-mobile"
      size="4xl"
      onExitComplete={onExited}
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-border shrink-0">
        <div className="min-w-0">
          <h2
            id="add-movie-title"
            className="text-title-lg text-text-primary tracking-tight truncate"
          >
            {isEditMode ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
          </h2>
        </div>
        <IconButton label="Đóng hộp thoại thêm phim" onClick={requestClose} variant="ghost">
          <X size={18} strokeWidth={1.5} aria-hidden="true" />
        </IconButton>
      </div>

      <DialogBody className="p-5 sm:p-6 lg:p-7">
        <LoadingStatus>
          {isLoadingDetails ? 'Đang tải thông tin phim…' : isSubmitting ? 'Đang lưu phim…' : ''}
        </LoadingStatus>
        {detailsError ? (
          <ErrorState
            title={detailsError}
            description="Thử tải lại thông tin phim hoặc đóng hộp thoại."
            retry={{ label: 'Thử lại', onClick: retryDetails }}
          />
        ) : isLoadingDetails ? (
          showSkeleton ? (
            <div aria-busy="true" className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
              <div className="w-full md:w-56 lg:w-64 shrink-0 flex flex-col items-center md:items-stretch space-y-3">
                <Skeleton className="w-full max-w-[200px] sm:max-w-[220px] md:max-w-none aspect-2/3 rounded-card sm:rounded-dialog shrink-0" />
                <Skeleton className="h-5 w-3/4 rounded-card" />
                <div className="w-full space-y-3 mt-2">
                  <Skeleton className="h-4 w-full rounded-card" />
                  <Skeleton className="h-4 w-5/6 rounded-card" />
                  <Skeleton className="h-4 w-2/3 rounded-card" />
                </div>
              </div>
              <div className="flex-1 w-full space-y-5 border-t border-border-default pt-5 md:border-t-0 md:border-l md:pl-6 md:pt-0 lg:pl-8">
                <Skeleton className="h-12 w-full rounded-card" />
                <Skeleton className="h-24 w-full rounded-card" />
                <Skeleton className="h-20 w-full rounded-card" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Skeleton className="h-11 rounded-card" />
                  <Skeleton className="h-11 rounded-card" />
                </div>
              </div>
            </div>
          ) : null
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start"
          >
            <aside
              aria-label="Thông tin phim"
              className="w-full md:w-56 lg:w-64 shrink-0 flex flex-col items-center md:items-stretch"
            >
              {isManualMode ? (
                <>
                  <PosterPreview posterPath={formData.poster} title={formData.title} />
                  <div className="w-full max-w-[200px] sm:max-w-[220px] md:max-w-none text-center mt-3">
                    <p className="text-body-sm font-semibold text-text-primary line-clamp-2">
                      {formData.title || 'Chưa nhập tên phim'}
                    </p>
                    {formData.title_vi && (
                      <p className="text-body-sm text-text-secondary line-clamp-1 italic mt-0.5">
                        {formData.title_vi}
                      </p>
                    )}
                  </div>
                  <div className="w-full space-y-5 mt-5 md:mt-6 text-left">{infoFormFields}</div>
                </>
              ) : isEditingInfo ? (
                <div className="w-full space-y-5 text-left">
                  {infoFormFields}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center"
                    onClick={swapToSummary}
                    leadingIcon={<Eye size={14} strokeWidth={1.5} aria-hidden="true" />}
                  >
                    Xem thông tin
                  </Button>
                </div>
              ) : (
                <>
                  <PosterPreview posterPath={formData.poster} title={formData.title} />
                  <div className="w-full max-w-[200px] sm:max-w-[220px] md:max-w-none text-center md:text-left mt-3">
                    <p className="text-title-md text-text-primary line-clamp-2">
                      {formData.title || 'Chưa nhập tên phim'}
                    </p>
                    {formData.title_vi && (
                      <p className="text-body-sm text-text-secondary line-clamp-1 italic mt-0.5">
                        {formData.title_vi}
                      </p>
                    )}
                  </div>
                  <div className="w-full mt-4 border-t border-border-default">
                    <div className="flex items-baseline justify-between gap-3 py-2 border-b border-border-default">
                      <span className="text-label-caps text-text-secondary shrink-0">
                        Loại hình
                      </span>
                      <span className="text-body-sm font-semibold text-text-primary text-right truncate tabular-nums">
                        {isTVSeries ? 'Series' : 'Phim lẻ'}
                      </span>
                    </div>
                    {summaryMeta.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-baseline justify-between gap-3 py-2 border-b border-border-default"
                      >
                        <span className="text-label-caps text-text-secondary shrink-0">
                          {row.label}
                        </span>
                        <span className="text-body-sm font-semibold text-text-primary text-right truncate tabular-nums">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  {genreNames.length > 0 && (
                    <div className="w-full flex flex-wrap gap-1.5 py-3 border-b border-border-default">
                      {genreNames.map((g, i) => (
                        <Chip key={`${g}-${i}`} tone="muted">
                          {GENRE_TRANSLATIONS[g] || g}
                        </Chip>
                      ))}
                    </div>
                  )}
                  {formData.content && (
                    <p className="w-full mt-3 text-body-sm text-text-secondary line-clamp-4 whitespace-pre-line">
                      {formData.content}
                    </p>
                  )}
                  <Button
                    ref={editInfoButtonRef}
                    variant="ghost"
                    size="sm"
                    className="mt-4 w-full justify-center"
                    onClick={swapToEditInfo}
                    leadingIcon={<Pencil size={14} strokeWidth={1.5} aria-hidden="true" />}
                  >
                    Chỉnh sửa thông tin
                  </Button>
                </>
              )}
            </aside>

            <section
              aria-label="Đánh giá"
              className="flex-1 min-w-0 w-full space-y-5 border-t border-border-default pt-5 md:border-t-0 md:border-l md:pl-6 md:pt-0 lg:pl-8"
            >
              <StatusToggle status={status} setStatus={setStatus} />

              {status === 'history' && (
                <div className="flex items-center justify-between gap-3 p-4 border border-border rounded-card">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      aria-hidden="true"
                      className={`w-10 h-10 flex items-center justify-center rounded-control transition-colors shrink-0 ${formData.is_review ? 'bg-primary text-on-primary' : 'bg-black/10 dark:bg-white/5 text-text-secondary'}`}
                    >
                      <MessageSquare size={20} strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-body font-bold text-text-primary">Xem qua đánh giá</h3>
                      <p className="text-body-sm text-text-secondary font-medium">
                        Bật nếu bạn đã xem bản tóm tắt phim
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={!!formData.is_review}
                    onToggle={() => setFormData({ ...formData, is_review: !formData.is_review })}
                    label="Xem qua đánh giá"
                  />
                </div>
              )}
              {status !== 'watchlist' && (
                <RatingSection
                  rating={formData.rating}
                  hoverRating={hoverRating}
                  isAnimating={isAnimating && ratingError}
                  setRating={(r) => {
                    setFormData({ ...formData, rating: r });
                    setRatingError(false);
                  }}
                  setHoverRating={setHoverRating}
                  ratingRef={refs.rating}
                />
              )}

              {status !== 'watchlist' && (
                <div className="space-y-2">
                  <label
                    htmlFor="add-movie-review"
                    className="text-label-caps text-text-primary flex items-center gap-2 ml-1"
                  >
                    <MessageSquare
                      size={14}
                      strokeWidth={1.5}
                      className="text-primary"
                      aria-hidden="true"
                    />
                    Cảm nhận
                  </label>
                  <textarea
                    id="add-movie-review"
                    name="movie-review"
                    rows={4}
                    autoComplete="off"
                    value={formData.review}
                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                    className="w-full border border-border rounded-card px-4 py-3 text-body font-medium text-text-primary placeholder:text-text-muted focus-visible:border-primary/50 focus-ring transition-colors resize-none"
                    placeholder="Chia sẻ cảm nhận của bạn về phim…"
                  />
                </div>
              )}

              {status !== 'watchlist' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="add-movie-date"
                      className="text-label-caps text-text-primary flex items-center gap-2 ml-1"
                    >
                      <Calendar
                        size={14}
                        strokeWidth={1.5}
                        className="text-primary"
                        aria-hidden="true"
                      />
                      Ngày xem
                    </label>
                    <DatePicker
                      id="add-movie-date"
                      value={formData.date}
                      onChange={(val) => setFormData({ ...formData, date: val })}
                      placeholder="Chọn ngày…"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="add-movie-time"
                      className="text-label-caps text-text-primary flex items-center gap-2 ml-1"
                    >
                      <Clock
                        size={14}
                        strokeWidth={1.5}
                        className="text-primary"
                        aria-hidden="true"
                      />
                      Giờ xem
                    </label>
                    <TimePicker
                      id="add-movie-time"
                      value={formData.time}
                      onChange={(val) => setFormData({ ...formData, time: val })}
                      placeholder="Chọn giờ…"
                    />
                  </div>
                </div>
              )}

              {status !== 'watchlist' && isTVSeries && (
                <TVProgressSection
                  loading={tvProgressLoading}
                  error={tvProgressError}
                  onRetry={retryTVProgress}
                  isCompleted={isCompleted}
                  setIsCompleted={setIsCompleted}
                  currentSeason={currentSeason}
                  setCurrentSeason={setCurrentSeason}
                  currentEpisode={currentEpisode}
                  setCurrentEpisode={setCurrentEpisode}
                  totalEpisodes={totalEpisodes}
                  episodesPerSeason={episodesPerSeason}
                  maxSeasons={Math.max(parseInt(formData.seasons) || 1, resolvedSeasonCount)}
                  seasonDates={seasonDates}
                  onSeasonDateChange={setSeasonDate}
                  defaultDate={formData.date}
                />
              )}

              {status === 'history' && (
                <AlbumSection
                  loading={albumsLoading}
                  error={albumsError}
                  onRetry={retryAlbums}
                  isEditMode={isEditMode}
                  showCreateAlbum={showCreateAlbum}
                  setShowCreateAlbum={setShowCreateAlbum}
                  newAlbumName={newAlbumName}
                  setNewAlbumName={setNewAlbumName}
                  handleCreateAlbum={handleCreateAlbum}
                  creatingAlbum={creatingAlbum}
                  albums={albums}
                  selectedAlbumIds={selectedAlbumIds}
                  setSelectedAlbumIds={setSelectedAlbumIds}
                />
              )}
            </section>
          </form>
        )}
      </DialogBody>

      <div className="px-5 py-4 sm:px-6 border-t border-border flex flex-row items-center justify-end gap-2 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button variant="ghost" onClick={requestClose}>
          {movieExists && !isEditMode ? 'Đóng' : 'Hủy'}
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={submitDisabled}
          loading={isSubmitting}
          leadingIcon={<Save size={16} strokeWidth={1.5} aria-hidden="true" />}
        >
          {isSubmitting
            ? 'Đang lưu…'
            : movieExists && !isEditMode
              ? 'Đã có trong thư viện'
              : isEditMode
                ? 'Cập nhật'
                : 'Lưu phim'}
        </Button>
      </div>
    </Dialog>
  );
}

export default AddMovieModal;
