import { useState, useEffect } from 'react';

import { X, Save, Loader2, Film, Star, Type, Image, MessageSquare, Calendar, Clock } from 'lucide-react';

import { Dialog, DialogBody } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';

// Sub-components
import StatusToggle from './add-movie/StatusToggle';
import RatingSection from './add-movie/RatingSection';
import TVProgressSection from './add-movie/TVProgressSection';
import AlbumSection from './add-movie/AlbumSection';
import MovieFormFields from './add-movie/MovieFormFields';
import PosterPreview from './add-movie/PosterPreview';
import CustomDatePicker from '@/shared/components/ui/CustomDatePicker';
import CustomTimePicker from '@/shared/components/ui/CustomTimePicker';

// Hooks
import { useAddMovieForm } from '../hooks/useAddMovieForm';
import { COUNTRY_OPTIONS } from '@/constants';

function AddMovieModal() {
  const {
    isOpen, initialData, closeAddModal,
    formData, setFormData,
    status, setStatus,
    manualMediaType, setManualMediaType,
    isDirty, isSubmitting, isLoadingDetails, movieExists,
    ratingError, setRatingError,
    hoverRating, setHoverRating,
    isAnimating,
    currentSeason, setCurrentSeason,
    currentEpisode, setCurrentEpisode,
    isCompleted, setIsCompleted,
    totalEpisodes, episodesPerSeason,
    selectedAlbumIds, setSelectedAlbumIds,
    showCreateAlbum, setShowCreateAlbum,
    newAlbumName, setNewAlbumName,
    creatingAlbum,
    handleCreateAlbum,
    handleSubmit,
    genreOptions,
    selectedGenreIds, setSelectedGenreIds,
    isManualMode, isTVSeries,
    refs, errors, albums
  } = useAddMovieForm();

  const [activeTab, setActiveTab] = useState<'info' | 'review'>(initialData?.movieToEdit ? 'review' : 'info');

  useEffect(() => {
    if (errors.title || errors.country || errors.releaseDate || errors.runtime || errors.seasons) {
      setActiveTab('info');
    }
  }, [errors]);

  const isEditMode = !!initialData?.movieToEdit;
  const submitDisabled = isSubmitting || !isDirty || (movieExists && !isEditMode);

  return (
    <Dialog
      open={isOpen}
      onClose={closeAddModal}
      titleId="add-movie-title"
      descriptionId="add-movie-description"
      presentation="fullscreen-mobile"
      size="4xl"
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-border shrink-0">
        <div className="min-w-0">
          <h2 id="add-movie-title" className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight truncate font-display">
            {isEditMode ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
          </h2>
          <p id="add-movie-description" className="text-xs sm:text-sm text-text-secondary mt-0.5">
            {isEditMode ? 'Cập nhật thông tin phim trong thư viện.' : 'Lưu phim vào thư viện cá nhân.'}
          </p>
        </div>
        <IconButton label="Đóng hộp thoại thêm phim" onClick={closeAddModal} variant="secondary">
          <X size={18} aria-hidden="true" />
        </IconButton>
      </div>

      <DialogBody className="p-5 sm:p-6 lg:p-7">
        {isLoadingDetails ? (
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
            <div className="w-full max-w-[200px] sm:max-w-[220px] md:max-w-none md:w-56 lg:w-64 aspect-2/3 bg-black/5 dark:bg-white/5 rounded-2xl sm:rounded-3xl animate-pulse shrink-0 mx-auto md:mx-0" />
            <div className="flex-1 w-full space-y-6">
              <div className="h-11 bg-black/5 dark:bg-white/5 rounded-2xl w-full animate-pulse" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-20 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
                  <div className="h-20 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
                </div>
                <div className="h-12 bg-black/5 dark:bg-white/5 rounded-2xl w-full animate-pulse" />
                <div className="h-12 bg-black/5 dark:bg-white/5 rounded-2xl w-full animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-12 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
                  <div className="h-12 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
            <div className="w-full md:w-56 lg:w-64 shrink-0 flex flex-col items-center md:items-stretch space-y-3">
              <PosterPreview
                posterPath={formData.poster}
                title={formData.title}
              />
              <div className="w-full max-w-[200px] sm:max-w-[220px] md:max-w-none text-center">
                <p className="text-xs font-semibold text-text-primary line-clamp-2">
                  {formData.title || 'Chưa nhập tên phim'}
                </p>
                {formData.title_vi && (
                  <p className="text-[11px] text-text-secondary line-clamp-1 italic mt-0.5">
                    {formData.title_vi}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 w-full space-y-6">
              <div role="tablist" aria-label="Phần của biểu mẫu" className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-border">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'info'}
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2 ${activeTab === 'info' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  <Film size={15} aria-hidden="true" />
                  <span>Thông tin phim</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'review'}
                  onClick={() => setActiveTab('review')}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2 ${activeTab === 'review' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  <Star size={15} aria-hidden="true" />
                  <span>Đánh giá & Trải nghiệm</span>
                </button>
              </div>

              {activeTab === 'info' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="add-movie-title-input" className="text-sm font-semibold text-text-primary flex items-center gap-2 ml-1">
                        <Type size={14} className="text-primary" aria-hidden="true" />
                        Tiêu đề gốc
                      </label>
                      <input
                        id="add-movie-title-input"
                        ref={refs.title}
                        type="text"
                        required
                        aria-invalid={errors.title ? true : undefined}
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full h-11 bg-black/5 dark:bg-white/5 border border-border rounded-2xl px-4 text-sm font-bold text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-colors disabled:opacity-50 ${isAnimating && errors.title ? 'border-danger/50' : ''}`}
                        placeholder="Tên gốc của phim..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add-movie-title-vi" className="text-sm font-semibold text-text-primary flex items-center gap-2 ml-1">
                        <Type size={14} className="text-primary" aria-hidden="true" />
                        Tiêu đề tiếng Việt
                      </label>
                      <input
                        id="add-movie-title-vi"
                        type="text"
                        value={formData.title_vi}
                        onChange={e => setFormData({ ...formData, title_vi: e.target.value })}
                        className="w-full h-11 bg-black/5 dark:bg-white/5 border border-border rounded-2xl px-4 text-sm font-bold text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-colors disabled:opacity-50"
                        placeholder="Tên tiếng Việt..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="add-movie-poster" className="text-sm font-semibold text-text-primary flex items-center gap-2 ml-1">
                      <Image size={14} className="text-primary" aria-hidden="true" />
                      URL ảnh poster
                    </label>
                    <input
                      id="add-movie-poster"
                      type="text"
                      value={formData.poster}
                      onChange={e => setFormData({ ...formData, poster: e.target.value })}
                      className="w-full h-11 bg-black/5 dark:bg-white/5 border border-border rounded-2xl px-4 text-sm font-medium text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-colors"
                      placeholder="https://..."
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
                </div>
              )}

              {activeTab === 'review' && (
                <div className="space-y-5">
                  <StatusToggle status={status} setStatus={setStatus} />

                  {status === 'history' && (
                    <div className="flex items-center justify-between gap-3 p-4 bg-black/5 dark:bg-white/5 border border-border rounded-2xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div aria-hidden="true" className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors shrink-0 ${formData.is_review ? 'bg-primary/20 text-primary' : 'bg-black/10 dark:bg-white/5 text-text-secondary'}`}>
                          <MessageSquare size={20} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-text-primary">Xem qua review</h4>
                          <p className="text-xs text-text-secondary font-medium">Đánh dấu nếu bạn xem bản tóm tắt phim</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={!!formData.is_review}
                        aria-label="Xem qua review"
                        onClick={() => setFormData({ ...formData, is_review: !formData.is_review })}
                        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${formData.is_review ? 'bg-primary' : 'bg-black/20 dark:bg-white/10'}`}
                      >
                        <span aria-hidden="true" className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${formData.is_review ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  )}
                  {status === 'history' && (
                    <RatingSection
                      rating={formData.rating}
                      hoverRating={hoverRating}
                      isAnimating={isAnimating && ratingError}
                      setRating={(r) => { setFormData({ ...formData, rating: r }); setRatingError(false); }}
                      setHoverRating={setHoverRating}
                      ratingRef={refs.rating}
                    />
                  )}

                  {status === 'history' && (
                    <div className="space-y-2">
                      <label htmlFor="add-movie-review" className="text-sm font-semibold text-text-primary flex items-center gap-2 ml-1">
                        <MessageSquare size={14} className="text-primary" aria-hidden="true" />
                        Review và cảm nhận
                      </label>
                      <textarea
                        id="add-movie-review"
                        rows={4}
                        value={formData.review}
                        onChange={e => setFormData({ ...formData, review: e.target.value })}
                        className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-2xl px-4 py-3 text-sm font-medium text-text-primary placeholder-text-secondary focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-colors resize-none"
                        placeholder="Bạn thấy phim này thế nào?"
                      />
                    </div>
                  )}

                  {status === 'history' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="add-movie-date" className="text-sm font-semibold text-text-primary flex items-center gap-2 ml-1">
                          <Calendar size={14} className="text-primary" aria-hidden="true" />
                          Ngày xem
                        </label>
                        <CustomDatePicker
                          value={formData.date}
                          onChange={(val) => setFormData({ ...formData, date: val })}
                          placeholder="Chọn ngày..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="add-movie-time" className="text-sm font-semibold text-text-primary flex items-center gap-2 ml-1">
                          <Clock size={14} className="text-primary" aria-hidden="true" />
                          Giờ xem
                        </label>
                        <CustomTimePicker
                          value={formData.time}
                          onChange={(val) => setFormData({ ...formData, time: val })}
                          placeholder="Chọn giờ..."
                        />
                      </div>
                    </div>
                  )}

                  {status === 'history' && isTVSeries && (
                    <TVProgressSection
                      isCompleted={isCompleted}
                      setIsCompleted={setIsCompleted}
                      currentSeason={currentSeason}
                      setCurrentSeason={setCurrentSeason}
                      currentEpisode={currentEpisode}
                      setCurrentEpisode={setCurrentEpisode}
                      totalEpisodes={totalEpisodes}
                      episodesPerSeason={episodesPerSeason}
                      maxSeasons={parseInt(formData.seasons) || 1}
                    />
                  )}

                  {status === 'history' && (
                    <AlbumSection
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
                </div>
              )}
            </div>
          </form>
        )}
      </DialogBody>

      <div className="px-5 py-4 sm:px-6 border-t border-border flex flex-row items-center justify-end gap-2 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button variant="ghost" onClick={closeAddModal}>
          {(movieExists && !isEditMode) ? 'Đóng' : 'Hủy bỏ'}
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={submitDisabled}
          loading={isSubmitting}
          leadingIcon={isSubmitting ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
        >
          {(movieExists && !isEditMode) ? 'Đã có trong thư viện' : (isEditMode ? 'Cập nhật' : 'Lưu phim')}
        </Button>
      </div>
    </Dialog>
  );
}

export default AddMovieModal;
