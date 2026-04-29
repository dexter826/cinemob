import React, { useState, useEffect, useRef } from 'react';

import { X, Save, Loader2, ArrowLeft, Film, Star } from 'lucide-react';

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
import { usePreventScroll } from '../../hooks/usePreventScroll';

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

  const [activeTab, setActiveTab] = useState<'info' | 'review'>(initialData?.movieToEdit ? 'review' : 'info');

  useEffect(() => {
    if (errors.title || errors.country || errors.releaseDate || errors.runtime || errors.seasons) {
      setActiveTab('info');
    }
  }, [errors]);




  const countryOptions = [
    { value: 'USA', label: 'Mỹ' }, { value: 'Vietnam', label: 'Việt Nam' }, { value: 'Korea', label: 'Hàn Quốc' },
    { value: 'Japan', label: 'Nhật Bản' }, { value: 'China', label: 'Trung Quốc' }, { value: 'Thailand', label: 'Thái Lan' },
    { value: 'UK', label: 'Anh' }, { value: 'France', label: 'Pháp' }, { value: 'Germany', label: 'Đức' },
    { value: 'Italy', label: 'Ý' }, { value: 'Spain', label: 'Tây Ban Nha' }, { value: 'India', label: 'Ấn Độ' },
    { value: 'Hong Kong', label: 'Hồng Kông' }, { value: 'Taiwan', label: 'Đài Loan' }, { value: 'Other', label: 'Khác' }
  ];

  usePreventScroll(isOpen);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-surface border border-border-default rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-premium flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border-default bg-surface/90 backdrop-blur-xl shrink-0">
              <h2 className="text-2xl font-bold text-text-main tracking-tight">
                {initialData?.movieToEdit ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
              </h2>
              <button
                onClick={closeAddModal}
                className="w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-border-default rounded-xl text-text-muted hover:text-text-main hover:border-primary/30 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              {isLoadingDetails ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <Loader2 className="animate-spin text-primary opacity-20" size={48} />
                    <Loader2 className="animate-spin text-primary absolute inset-0" size={48} style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                  </div>
                  <p className="text-text-muted font-bold text-sm tracking-widest uppercase opacity-60">Đang đồng bộ dữ liệu...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-10">
                  <PosterPreview
                    posterPath={formData.poster}
                    title={formData.title}
                    isManualMode={isManualMode}
                  />

                  <div className="flex-1 space-y-8">
                    {/* Tabs Navigation */}
                    <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-border-default gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('info')}
                        className={`flex-1 py-2.5 text-xs font-bold transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2 ${activeTab === 'info' ? 'bg-surface text-primary shadow-premium border border-border-default' : 'text-text-muted hover:text-text-main hover:bg-surface/50'}`}
                      >
                        <Film size={14} />
                        <span className="uppercase tracking-widest">Thông tin</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('review')}
                        className={`flex-1 py-2.5 text-xs font-bold transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2 ${activeTab === 'review' ? 'bg-surface text-primary shadow-premium border border-border-default' : 'text-text-muted hover:text-text-main hover:bg-surface/50'}`}
                      >
                        <Star size={14} />
                        <span className="uppercase tracking-widest">Nhật ký</span>
                      </button>
                    </div>

                    {activeTab === 'info' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-60">Tiêu đề gốc</label>
                            <input
                              ref={refs.title}
                              type="text"
                              required
                              value={formData.title}
                              onChange={e => setFormData({ ...formData, title: e.target.value })}
                              className={`w-full bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-5 py-3.5 text-base font-bold text-text-main focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 ${isAnimating && errors.title ? 'scale-[1.02] border-error/50' : ''}`}
                              placeholder="Tên gốc của phim..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-60">Tiêu đề tiếng Việt</label>
                            <input
                              type="text"
                              value={formData.title_vi}
                              onChange={e => setFormData({ ...formData, title_vi: e.target.value })}
                              className="w-full bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-5 py-3.5 text-base font-bold text-text-main focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                              placeholder="Tên tiếng Việt..."
                            />
                          </div>
                        </div>

                        <div className="space-y-2 mt-4">
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-60">URL Ảnh Poster</label>
                          <input
                            type="text"
                            value={formData.poster}
                            onChange={e => setFormData({ ...formData, poster: e.target.value })}
                            className="w-full bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-5 py-3.5 text-sm font-medium text-text-main focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
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
                          countryOptions={countryOptions}
                          genreOptions={genreOptions}
                          selectedGenreIds={selectedGenreIds}
                          setSelectedGenreIds={setSelectedGenreIds}
                          isAnimating={isAnimating}
                          errors={errors}
                          refs={refs}
                          status={status}
                        />
                      </div>
                    )}

                    {activeTab === 'review' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
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
                          <div className="space-y-3 animate-in fade-in duration-300">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-60">Review & Cảm nhận</label>
                            <textarea
                              rows={4}
                              value={formData.review}
                              onChange={e => setFormData({ ...formData, review: e.target.value })}
                              className="w-full bg-black/5 dark:bg-white/5 border border-border-default rounded-[24px] px-5 py-4 text-sm font-medium text-text-main placeholder-text-muted focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all custom-scrollbar resize-none hover:border-border-default/80"
                              placeholder="Bạn thấy phim này thế nào?"
                            />
                          </div>
                        )}

                        {status === 'history' && (
                          <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-300">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-60">Ngày xem</label>
                              <CustomDatePicker
                                value={formData.date}
                                onChange={(val) => setFormData({ ...formData, date: val })}
                                placeholder="Chọn ngày..."
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-60">Giờ xem</label>
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
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-border-default bg-surface/90 backdrop-blur-xl flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={closeAddModal}
                className="px-8 py-3.5 rounded-2xl text-sm font-bold text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
              >
                {(movieExists && !initialData?.movieToEdit) ? 'Đóng' : 'Hủy bỏ'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isDirty || (movieExists && !initialData?.movieToEdit)}
                className="bg-primary hover:shadow-premium text-white px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 shadow-lg shadow-primary/20 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {(movieExists && !initialData?.movieToEdit) ? 'Đã có trong thư viện' : (initialData?.movieToEdit ? 'Cập nhật' : 'Lưu phim')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddMovieModal;
