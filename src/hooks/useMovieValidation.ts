import { useState, useRef, useEffect, useCallback } from 'react';
import useToastStore from '../stores/toastStore';
import { MESSAGES } from '../constants/messages';

export interface FormErrors {
  title: boolean;
  country: boolean;
  releaseDate: boolean;
  runtime: boolean;
  seasons: boolean;
}

/** Hook xử lý validation và hiệu ứng lỗi cho form phim. */
export const useMovieValidation = () => {
  const { showToast } = useToastStore();
  const [ratingError, setRatingError] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    title: false,
    country: false,
    releaseDate: false,
    runtime: false,
    seasons: false
  });
  const [errorTrigger, setErrorTrigger] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const refs = {
    title: useRef<HTMLInputElement>(null),
    country: useRef<HTMLDivElement>(null),
    releaseDate: useRef<HTMLDivElement>(null),
    runtime: useRef<HTMLInputElement>(null),
    seasons: useRef<HTMLInputElement>(null),
    rating: useRef<HTMLDivElement>(null)
  };

  /** Xóa toàn bộ trạng thái lỗi. */
  const clearErrors = useCallback(() => {
    setRatingError(false);
    setErrors({ title: false, country: false, releaseDate: false, runtime: false, seasons: false });
    setErrorTrigger(0);
  }, []);

  /** Cuộn đến phần tử lỗi khi có thay đổi trigger. */
  useEffect(() => {
    if (errorTrigger > 0) {
      const errorKey = (Object.keys(errors) as Array<keyof FormErrors>).find(k => errors[k]) || (ratingError ? 'rating' : null);
      if (errorKey && (refs as any)[errorKey]?.current) {
        (refs as any)[errorKey].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setIsAnimating(false);
        setTimeout(() => setIsAnimating(true), 10);
        setTimeout(() => setIsAnimating(false), 1010);
      }
    }
  }, [errorTrigger, errors, ratingError]);

  /** Thực hiện validate các trường dữ liệu. */
  const validate = (
    isManualMode: boolean,
    isTVSeries: boolean,
    status: 'history' | 'watchlist',
    formData: any
  ): boolean => {
    if (isManualMode) {
      const newErrors = {
        title: !formData.title.trim(),
        country: !formData.country.trim(),
        releaseDate: !formData.releaseDate,
        seasons: isTVSeries && (!formData.seasons || parseInt(formData.seasons) <= 0),
        runtime: !isTVSeries && (!formData.runtime || parseInt(formData.runtime) <= 0)
      };

      if (Object.values(newErrors).some(v => v)) {
        setErrors(newErrors);
        setErrorTrigger(p => p + 1);
        showToast(MESSAGES.COMMON.REQUIRED_FIELDS, "error");
        return false;
      }
    }

    if (status === 'history' && formData.rating === 0) {
      setRatingError(true);
      setErrorTrigger(p => p + 1);
      showToast(MESSAGES.MOVIE.REQUIRED_RATING, "error");
      return false;
    }

    return true;
  };

  return {
    ratingError, setRatingError,
    errors, setErrors,
    errorTrigger, setErrorTrigger,
    isAnimating, refs,
    clearErrors, validate
  };
};
