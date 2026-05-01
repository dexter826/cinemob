import React, { useState, useEffect, useRef } from 'react';

import { X, Save, Loader2, ArrowLeft, Film, Star, Type, BookOpen, Image, MessageSquare, Calendar, Clock } from 'lucide-react';

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
import { COUNTRY_OPTIONS, MODAL_VARIANTS, OVERLAY_VARIANTS } from '../../constants';

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




  const countryOptions = COUNTRY_OPTIONS;

  usePreventScroll(isOpen);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={OVERLAY_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <motion.div
            variants={MODAL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface border border-border-default rounded-3xl sm:rounded-4xl w-full max-w-5xl h-full sm:h-auto max-h-full sm:max-h-[90vh] overflow-hidden shadow-premium flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-6 border-b border-border-default bg-surface/90 backdrop-blur-xl shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
                {initialData?.movieToEdit ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
              </h2>
              <button
                onClick={closeAddModal}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-border-default rounded-xl text-text-muted hover:text-text-main hover:border-primary/30 transition-all cursor-pointer"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8">
              {isLoadingDetails ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <Loader2 className="animate-spin text-primary opacity-20" size={48} />
                    <Loader2 className="animate-spin text-primary absolute inset-0" size={48} style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                  </div>
                  <p className="text-text-muted font-bold text-sm tracking-widest uppercase opacity-60">Đang đồng bộ dữ liệu...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6">
                  <PosterPreview
                    posterPath={formData.poster}
                    title={formData.title}
                    isManualMode={isManualMode}
                  />

                  <div className="flex-1 space-y-6">
                    {/* Tabs Navigation */}
                    <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-border-default relative">
                      <button
                        type="button"
                        onClick={() => setActiveTab('info')}
                        className={`flex-1 relative z-10 py-2.5 text-xs font-bold transition-colors duration-300 cursor-pointer rounded-xl flex items-center justify-center gap-2 ${activeTab === 'info' ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
                      >
                        <Film size={14} />
                        <span className="uppercase tracking-widest">Thông tin</span>
                        {activeTab === 'info' && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-surface border border-border-default shadow-premium rounded-xl z-[-1]"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('review')}
                        className={`flex-1 relative z-10 py-2.5 text-xs font-bold transition-colors duration-300 cursor-pointer rounded-xl flex items-center justify-center gap-2 ${activeTab === 'review' ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
                      >
                        <Star size={14} />
                        <span className="uppercase tracking-widest">Đánh giá</span>
                        {activeTab === 'review' && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-surface border border-border-default shadow-premium rounded-xl z-[-1]"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                    </div>

                    {activeTab === 'info' && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
                              <Type size={14} className="text-primary" />
                              Tiêu đề gốc
                            </label>
                            <input
                              ref={refs.title}
                              type="text"
                              required
                              value={formData.title}
                              onChange={e => setFormData({ ...formData, title: e.target.value })}
                              className={`w-full h-11 bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-4 text-sm font-bold text-text-main focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all disabled:opacity-50 ${isAnimating && errors.title ? 'scale-[1.02] border-error/50' : ''}`}
                              placeholder="Tên gốc của phim..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
                              <Type size={14} className="text-primary" />
                              Tiêu đề tiếng Việt
                            </label>
                            <input
                              type="text"
                              value={formData.title_vi}
                              onChange={e => setFormData({ ...formData, title_vi: e.target.value })}
                              className="w-full h-11 bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-4 text-sm font-bold text-text-main focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                              placeholder="Tên tiếng Việt..."
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
                            <Image size={14} className="text-primary" />
                            URL Ảnh Poster
                          </label>
                          <input
                            type="text"
                            value={formData.poster}
                            onChange={e => setFormData({ ...formData, poster: e.target.value })}
                            className="w-full h-11 bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-4 text-sm font-medium text-text-main focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
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
                      <div className="space-y-5">
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
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
                              <MessageSquare size={14} className="text-primary" />
                              Review & Cảm nhận
                            </label>
                            <textarea
                              rows={4}
                              value={formData.review}
                              onChange={e => setFormData({ ...formData, review: e.target.value })}
                              className="w-full bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-4 py-3 text-sm font-medium text-text-main placeholder-text-muted focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all custom-scrollbar resize-none hover:border-border-default/80 shadow-sm"
                              placeholder="Bạn thấy phim này thế nào?"
                            />
                          </div>
                        )}

                        {status === 'history' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
                                <Calendar size={14} className="text-primary" />
                                Ngày xem
                              </label>
                              <CustomDatePicker
                                value={formData.date}
                                onChange={(val) => setFormData({ ...formData, date: val })}
                                placeholder="Chọn ngày..."
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
                                <Clock size={14} className="text-primary" />
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
            <div className="px-6 py-4 sm:px-8 sm:py-6 border-t border-border-default bg-surface/90 backdrop-blur-xl flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={closeAddModal}
                className="order-2 sm:order-1 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
              >
                {(movieExists && !initialData?.movieToEdit) ? 'Đóng' : 'Hủy bỏ'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isDirty || (movieExists && !initialData?.movieToEdit)}
                className="order-1 sm:order-2 bg-primary hover:shadow-premium text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 shadow-lg shadow-primary/20 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
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
