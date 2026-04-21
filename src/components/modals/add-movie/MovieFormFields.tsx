import React from 'react';
import { Film, Globe, Calendar, Tv, Clock, AlignLeft } from 'lucide-react';
import CustomDropdown from '../../ui/CustomDropdown';
import CustomDatePicker from '../../ui/CustomDatePicker';
import MultiSelectDropdown from '../../ui/MultiSelectDropdown';

interface MovieFormFieldsProps {
  isManualMode: boolean;
  manualMediaType: 'movie' | 'tv';
  setManualMediaType: (type: 'movie' | 'tv') => void;
  formData: any;
  setFormData: (data: any) => void;
  isTVSeries: boolean;
  countryOptions: any[];
  genreOptions: any[];
  selectedGenreIds: number[];
  setSelectedGenreIds: (ids: number[]) => void;
  isAnimating: boolean;
  errors: {
    country: boolean;
    releaseDate: boolean;
    runtime: boolean;
    seasons: boolean;
    title: boolean;
  };
  refs: {
    country: React.RefObject<HTMLDivElement | null>;
    releaseDate: React.RefObject<HTMLDivElement | null>;
    runtime: React.RefObject<HTMLInputElement | null>;
    seasons: React.RefObject<HTMLInputElement | null>;
  };
  status: 'history' | 'watchlist';
}

const MovieFormFields: React.FC<MovieFormFieldsProps> = ({
  isManualMode,
  manualMediaType,
  setManualMediaType,
  formData,
  setFormData,
  isTVSeries,
  countryOptions,
  genreOptions,
  selectedGenreIds,
  setSelectedGenreIds,
  isAnimating,
  errors,
  refs,
  status
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Media Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Film size={12} /> Loại
          </label>
          {isManualMode ? (
            <CustomDropdown
              options={[
                { value: 'movie', label: 'Phim lẻ' },
                { value: 'tv', label: 'TV Series' },
              ]}
              value={manualMediaType}
              onChange={(value) => {
                setManualMediaType(value as 'movie' | 'tv');
                setFormData((prev: any) => ({ ...prev, runtime: '', seasons: '' }));
              }}
              placeholder="Chọn loại"
            />
          ) : (
            <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-text-main text-sm">
              {isTVSeries ? 'TV Series' : 'Phim lẻ'}
            </div>
          )}
        </div>

        {/* Country */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Globe size={12} /> Quốc gia
          </label>
          {isManualMode ? (
            <div ref={refs.country} className={`transition-transform duration-500 ${isAnimating && errors.country ? 'scale-110' : ''}`}>
              <CustomDropdown
                options={countryOptions}
                value={formData.country}
                onChange={(value) => {
                  setFormData({ ...formData, country: value as string });
                }}
                placeholder="Chọn quốc gia..."
              />
            </div>
          ) : (
            <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-text-main opacity-70">
              {formData.country || 'Không có thông tin'}
            </div>
          )}
        </div>

        {/* Release Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={12} /> Phát hành
          </label>
          <div ref={refs.releaseDate} className={`transition-transform duration-500 ${isAnimating && errors.releaseDate ? 'scale-110' : ''}`}>
            {isManualMode ? (
              <CustomDatePicker
                value={formData.releaseDate}
                onChange={(val) => {
                  setFormData({ ...formData, releaseDate: val });
                }}
                placeholder="Chọn ngày phát hành..."
              />
            ) : (
              <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-text-main opacity-50">
                {formData.releaseDate ? (() => {
                  const [y, m, d] = formData.releaseDate.split('-').map(Number);
                  return `${d}/${m}/${y}`;
                })() : 'Không có thông tin'}
              </div>
            )}
          </div>
        </div>

        {/* Runtime / Seasons */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            {isTVSeries ? <Tv size={12} /> : <Clock size={12} />}
            {isTVSeries ? 'Số phần' : 'Thời lượng (phút)'}
          </label>
          <div className={`transition-transform duration-500 ${isAnimating && ((isTVSeries && errors.seasons) || (!isTVSeries && errors.runtime)) ? 'scale-110' : ''}`}>
            <input
              ref={isTVSeries ? refs.seasons : refs.runtime}
              type="number"
              required
              disabled={!isManualMode}
              value={isTVSeries ? formData.seasons : formData.runtime}
              onChange={e => {
                setFormData({ ...formData, [isTVSeries ? 'seasons' : 'runtime']: e.target.value });
              }}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Genres */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Thể loại</label>
        {isManualMode || formData.genres !== undefined ? (
          <MultiSelectDropdown
            options={genreOptions.map(g => ({ value: g.id, label: g.name }))}
            values={selectedGenreIds}
            onChange={(values) => {
              setSelectedGenreIds(values as number[]);
              const genreNames = genreOptions
                .filter(g => values.includes(g.id))
                .map(g => g.name)
                .join(', ');
              setFormData((prev: any) => ({ ...prev, genres: genreNames }));
            }}
            placeholder="Chọn thể loại..."
            searchable={true}
            maxDisplay={5}
            className="w-full"
          />
        ) : (
          <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-text-main opacity-70">
            {formData.genres || 'Không có thể loại'}
          </div>
        )}
      </div>

      {/* Overview */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <AlignLeft size={12} /> Nội dung
        </label>
        <textarea
          rows={5}
          value={formData.content}
          onChange={e => setFormData({ ...formData, content: e.target.value })}
          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-text-main placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all custom-scrollbar resize-none"
          placeholder="Tóm tắt nội dung phim..."
        />
      </div>

      {/* Review (History Only) */}
      {status === 'history' && (
        <div className="space-y-1.5 animate-in fade-in duration-300">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Review ngắn</label>
          <textarea
            rows={3}
            value={formData.review}
            onChange={e => setFormData({ ...formData, review: e.target.value })}
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-text-main placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all custom-scrollbar resize-none"
            placeholder="Cảm nhận của bạn về phim..."
          />
        </div>
      )}
    </div>
  );
};

export default MovieFormFields;
