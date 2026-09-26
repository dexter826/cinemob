import React from 'react';
import { Film, Globe, Calendar, Tv, Clock, AlignLeft } from 'lucide-react';
import CustomDropdown from '@/shared/components/ui/CustomDropdown';
import CustomDatePicker from '@/shared/components/ui/CustomDatePicker';
import MultiSelectDropdown from '@/shared/components/ui/MultiSelectDropdown';
import { GENRE_TRANSLATIONS } from '@/constants/genres';
import type { MovieFormData } from '../../hooks/useAddMovieForm';

interface GenreOption {
  id: number;
  name: string;
}

interface CountryOption {
  value: string;
  label: string;
}

interface MovieFormFieldsProps {
  isManualMode: boolean;
  manualMediaType: 'movie' | 'tv';
  setManualMediaType: (type: 'movie' | 'tv') => void;
  formData: MovieFormData;
  setFormData: (data: MovieFormData | ((prev: MovieFormData) => MovieFormData)) => void;
  isTVSeries: boolean;
  countryOptions: CountryOption[];
  genreOptions: GenreOption[];
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
}

// Các trường thông tin chi tiết phim
function MovieFormFields({
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
  refs
}: MovieFormFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Media Type */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-primary flex items-center gap-2 ml-1">
            <Film size={14} className="text-primary" aria-hidden="true" />
            Loại hình
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
                setFormData((prev) => ({ ...prev, runtime: '', seasons: '' }));
              }}
              placeholder="Chọn loại"
            />
          ) : (
            <div className="w-full h-11 flex items-center bg-black/5 dark:bg-white/5 border border-border rounded-2xl px-4 text-sm font-semibold text-text-secondary">
              {isTVSeries ? 'TV Series' : 'Phim lẻ'}
            </div>
          )}
        </div>

        {/* Country */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-primary flex items-center gap-2 ml-1">
            <Globe size={14} className="text-primary" aria-hidden="true" />
            Quốc gia
          </label>
          <div ref={refs.country} className={`transition-transform duration-300 ${isAnimating && errors.country ? 'scale-[1.02]' : ''}`}>
            <CustomDropdown
              options={countryOptions}
              value={formData.country}
              onChange={(value) => {
                setFormData({ ...formData, country: value as string });
              }}
              placeholder="Chọn quốc gia…"
            />
          </div>
        </div>

        {/* Release Date */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-primary flex items-center gap-2 ml-1">
            <Calendar size={14} className="text-primary" aria-hidden="true" />
            Ngày phát hành
          </label>
          <div ref={refs.releaseDate} className={`transition-transform duration-300 ${isAnimating && errors.releaseDate ? 'scale-[1.02]' : ''}`}>
            <CustomDatePicker
              value={formData.releaseDate}
              onChange={(val) => {
                setFormData({ ...formData, releaseDate: val });
              }}
              placeholder="Chọn ngày…"
            />
          </div>
        </div>

        {/* Runtime / Seasons */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-primary flex items-center gap-2 ml-1">
            {isTVSeries ? <Tv size={14} className="text-primary" aria-hidden="true" /> : <Clock size={14} className="text-primary" aria-hidden="true" />}
            {isTVSeries ? 'Số mùa' : 'Thời lượng (phút)'}
          </label>
          <div className={`transition-transform duration-300 ${isAnimating && ((isTVSeries && errors.seasons) || (!isTVSeries && errors.runtime)) ? 'scale-[1.02]' : ''}`}>
            <input
              ref={isTVSeries ? refs.seasons : refs.runtime}
              type="number"
              required
              disabled={!isManualMode}
              value={isTVSeries ? formData.seasons : formData.runtime}
              onChange={e => {
                setFormData({ ...formData, [isTVSeries ? 'seasons' : 'runtime']: e.target.value });
              }}
              className="w-full h-11 bg-black/5 dark:bg-white/5 border border-border rounded-2xl px-4 text-sm font-semibold text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-colors disabled:opacity-50 tabular-nums"
              placeholder={isTVSeries ? "Số mùa…" : "Phút…"}
            />
          </div>
        </div>
      </div>

      {/* Genres */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-text-primary flex items-center gap-2 ml-1">
          <Film size={14} className="text-primary" aria-hidden="true" />
          Thể loại phim
        </label>
        <MultiSelectDropdown
          options={genreOptions.map(g => ({ value: g.id, label: GENRE_TRANSLATIONS[g.name] || g.name }))}
          values={selectedGenreIds}
          onChange={(values) => {
            setSelectedGenreIds(values as number[]);
            const genreNames = genreOptions
              .filter(g => values.includes(g.id))
              .map(g => g.name)
              .join(', ');
            setFormData((prev) => ({ ...prev, genres: genreNames }));
          }}
          placeholder="Tìm hoặc chọn thể loại…"
          searchable={true}
          maxDisplay={5}
          className="w-full"
        />
      </div>

      {/* Overview */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-text-primary flex items-center gap-2 ml-1">
          <AlignLeft size={14} className="text-primary" aria-hidden="true" />
          Nội dung tóm tắt
        </label>
        <textarea
          rows={5}
          value={formData.content}
          onChange={e => setFormData({ ...formData, content: e.target.value })}
          className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-2xl px-4 py-3 text-sm font-medium text-text-primary placeholder-text-secondary focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-colors resize-none"
          placeholder="Giới thiệu ngắn về cốt truyện..."
        />
      </div>
    </div>
  );
};

export default MovieFormFields;
