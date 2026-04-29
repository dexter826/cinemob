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
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Media Type */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
            <Film size={14} className="text-primary" /> Loại hình
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
            <div className="w-full bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-5 py-3.5 text-sm font-bold text-text-muted opacity-80 backdrop-blur-sm shadow-sm">
              {isTVSeries ? 'TV Series' : 'Phim lẻ'}
            </div>
          )}
        </div>

        {/* Country */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
            <Globe size={14} className="text-primary" /> Quốc gia
          </label>
          <div ref={refs.country} className={`transition-transform duration-500 ${isAnimating && errors.country ? 'scale-[1.02]' : ''}`}>
            <CustomDropdown
              options={countryOptions}
              value={formData.country}
              onChange={(value) => {
                setFormData({ ...formData, country: value as string });
              }}
              placeholder="Chọn quốc gia..."
            />
          </div>
        </div>

        {/* Release Date */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
            <Calendar size={14} className="text-primary" /> Phát hành
          </label>
          <div ref={refs.releaseDate} className={`transition-transform duration-500 ${isAnimating && errors.releaseDate ? 'scale-[1.02]' : ''}`}>
            <CustomDatePicker
              value={formData.releaseDate}
              onChange={(val) => {
                setFormData({ ...formData, releaseDate: val });
              }}
              placeholder="Chọn ngày..."
            />
          </div>
        </div>

        {/* Runtime / Seasons */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
            {isTVSeries ? <Tv size={14} className="text-primary" /> : <Clock size={14} className="text-primary" />}
            {isTVSeries ? 'Số phần' : 'Thời lượng (phút)'}
          </label>
          <div className={`transition-transform duration-500 ${isAnimating && ((isTVSeries && errors.seasons) || (!isTVSeries && errors.runtime)) ? 'scale-[1.02]' : ''}`}>
            <input
              ref={isTVSeries ? refs.seasons : refs.runtime}
              type="number"
              required
              value={isTVSeries ? formData.seasons : formData.runtime}
              onChange={e => {
                setFormData({ ...formData, [isTVSeries ? 'seasons' : 'runtime']: e.target.value });
              }}
              className="w-full bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-5 py-3.5 text-sm font-bold text-text-main focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-sm"
              placeholder={isTVSeries ? "Số phần..." : "Phút..."}
            />
          </div>
        </div>
      </div>

      {/* Genres */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-60">Thể loại phim</label>
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
          placeholder="Tìm hoặc chọn thể loại..."
          searchable={true}
          maxDisplay={5}
          className="w-full"
        />
      </div>

      {/* Overview */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
          <AlignLeft size={14} className="text-primary" /> Nội dung tóm tắt
        </label>
        <textarea
          rows={6}
          value={formData.content}
          onChange={e => setFormData({ ...formData, content: e.target.value })}
          className="w-full bg-black/5 dark:bg-white/5 border border-border-default rounded-[24px] px-5 py-4 text-sm font-medium text-text-main placeholder-text-muted focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all custom-scrollbar resize-none shadow-sm"
          placeholder="Giới thiệu ngắn về cốt truyện..."
        />
      </div>
    </div>
  );
};

export default MovieFormFields;
