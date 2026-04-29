import React from 'react';
import { X, Save, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-components
import StatusToggle from './add-movie/StatusToggle';
import RatingSection from './add-movie/RatingSection';
import TVProgressSection from './add-movie/TVProgressSection';
import AlbumSection from './add-movie/AlbumSection';
import MovieFormFields from './add-movie/MovieFormFields';
import PosterPreview from './add-movie/PosterPreview';
import CustomDatePicker from '../ui/CustomDatePicker';
import CustomTimePicker from '../ui/CustomTimePicker';

// Hooks
import { useAddMovieForm } from '../../hooks/useAddMovieForm';

const AddMovieModal: React.FC = () => {
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

  const countryOptions = [
    { value: 'USA', label: 'Mỹ' }, { value: 'Vietnam', label: 'Việt Nam' }, { value: 'Korea', label: 'Hàn Quốc' },
    { value: 'Japan', label: 'Nhật Bản' }, { value: 'China', label: 'Trung Quốc' }, { value: 'Thailand', label: 'Thái Lan' },
    { value: 'UK', label: 'Anh' }, { value: 'France', label: 'Pháp' }, { value: 'Germany', label: 'Đức' },
    { value: 'Italy', label: 'Ý' }, { value: 'Spain', label: 'Tây Ban Nha' }, { value: 'India', label: 'Ấn Độ' },
    { value: 'Hong Kong', label: 'Hồng Kông' }, { value: 'Taiwan', label: 'Đài Loan' }, { value: 'Other', label: 'Khác' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-surface border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface/95 backdrop-blur shrink-0">
              <h2 className="text-xl font-bold text-text-main">
                {initialData?.movieToEdit ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
              </h2>
              <button
                onClick={closeAddModal}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {isLoadingDetails ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-primary" size={40} />
                  <p className="text-text-muted animate-pulse">Đang tải thông tin chi tiết...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
                  <PosterPreview
                    posterPath={formData.poster}
                    title={formData.title}
                    isManualMode={isManualMode}
                  />

                  <div className="flex-1 space-y-8">
                    <div className="space-y-6">
                      <StatusToggle status={status} setStatus={setStatus} />

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
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block">Ngày xem</label>
                            <CustomDatePicker
                              value={formData.date}
                              onChange={(val) => setFormData({ ...formData, date: val })}
                              placeholder="Chọn ngày xem..."
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block">Giờ xem</label>
                            <CustomTimePicker
                              value={formData.time}
                              onChange={(val) => setFormData({ ...formData, time: val })}
                              placeholder="Chọn giờ xem..."
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider block">Tiêu đề</label>
                        <input
                          ref={refs.title}
                          type="text"
                          required
                          disabled={!isManualMode}
                          value={formData.title_vi ? `${formData.title} (${formData.title_vi})` : formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          className={`w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50 ${isAnimating && errors.title ? 'scale-105' : ''}`}
                          placeholder="Tên phim..."
                        />
                      </div>

                      <MovieFormFields
                        isManualMode={isManualMode}
                        manualMediaType={manualMediaType}
                        setManualMediaType={setManualMediaType}
                        formData={formData}
                        setFormData={setFormData}
                        isTVSeries={isTVSeries}
                        countryOptions={countryOptions}
                        genreOptions={genreOptions}
                        selectedGenreIds={selectedGenreIds}
                        setSelectedGenreIds={setSelectedGenreIds}
                        isAnimating={isAnimating}
                        errors={errors}
                        refs={refs}
                        status={status}
                      />

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
                          isEditMode={!!initialData?.movieToEdit}
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
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/10 dark:border-white/10 bg-surface/95 backdrop-blur flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={closeAddModal}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {(movieExists && !initialData?.movieToEdit) ? 'Đóng' : 'Hủy bỏ'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isDirty || (movieExists && !initialData?.movieToEdit)}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-primary/20 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {(movieExists && !initialData?.movieToEdit) ? 'Đã có trong thư viện' : (initialData?.movieToEdit ? 'Lưu thay đổi' : 'Lưu phim')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddMovieModal;
