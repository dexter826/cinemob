import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import useToastStore from '@/shared/stores/toast-store';
import { MESSAGES } from '@/constants/messages';
import { MovieStatus } from '@/types';

export interface FormErrors {
  title: boolean;
  country: boolean;
  releaseDate: boolean;
  runtime: boolean;
  seasons: boolean;
}

export interface FormValidationData {
  title: string;
  country: string;
  releaseDate: string;
  seasons?: string | number;
  runtime?: string | number;
  rating?: number;
}

export interface FormFieldRefs {
  title: React.RefObject<HTMLInputElement | null>;
  country: React.RefObject<HTMLDivElement | null>;
  releaseDate: React.RefObject<HTMLDivElement | null>;
  runtime: React.RefObject<HTMLInputElement | null>;
  seasons: React.RefObject<HTMLInputElement | null>;
  rating: React.RefObject<HTMLDivElement | null>;
}

export const useMovieValidation = () => {
  const { showToast } = useToastStore();
  const [ratingError, setRatingError] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    title: false,
    country: false,
    releaseDate: false,
    runtime: false,
    seasons: false,
  });
  const [errorTrigger, setErrorTrigger] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const releaseDateRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<HTMLInputElement>(null);
  const seasonsRef = useRef<HTMLInputElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);
  const refs: FormFieldRefs = useMemo(
    () => ({
      title: titleRef,
      country: countryRef,
      releaseDate: releaseDateRef,
      runtime: runtimeRef,
      seasons: seasonsRef,
      rating: ratingRef,
    }),
    [],
  );

  const clearErrors = useCallback(() => {
    setRatingError(false);
    setErrors({ title: false, country: false, releaseDate: false, runtime: false, seasons: false });
    setErrorTrigger(0);
  }, []);

  useEffect(() => {
    if (errorTrigger <= 0) return;
    const errorKey =
      (Object.keys(errors) as Array<keyof FormErrors>).find((k) => errors[k]) ||
      (ratingError ? 'rating' : null);
    const targetRef = errorKey ? (refs[errorKey] as React.RefObject<HTMLElement | null>) : null;
    if (!targetRef) return;

    const focusError = (el: HTMLElement): (() => void) => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
      // Đưa focus vào đúng trường lỗi: input trực tiếp, còn control tùy biến thì vào nút bên trong.
      if (el instanceof HTMLInputElement) {
        el.focus({ preventScroll: true });
      } else {
        el.querySelector<HTMLElement>(
          'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        )?.focus({
          preventScroll: true,
        });
      }
      setIsAnimating(false);
      const t1 = setTimeout(() => setIsAnimating(true), 10);
      const t2 = setTimeout(() => setIsAnimating(false), 1010);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    };

    if (targetRef.current) {
      const cleanup = focusError(targetRef.current);
      return () => cleanup();
    }
    let cleanup: (() => void) | null = null;
    const t = setTimeout(() => {
      if (targetRef.current) cleanup = focusError(targetRef.current);
    }, 50);
    return () => {
      clearTimeout(t);
      cleanup?.();
    };
  }, [errorTrigger, errors, ratingError, refs]);

  const validate = (
    isManualMode: boolean,
    isTVSeries: boolean,
    status: MovieStatus,
    formData: FormValidationData,
  ): boolean => {
    const newErrors = {
      title: !formData.title.trim(),
      country: false,
      releaseDate: false,
      seasons: false,
      runtime: false,
    };
    if (isManualMode) {
      newErrors.country = !formData.country.trim();
      newErrors.releaseDate = !formData.releaseDate;
      newErrors.seasons =
        isTVSeries && (!formData.seasons || parseInt(String(formData.seasons)) <= 0);
      newErrors.runtime =
        !isTVSeries && (!formData.runtime || parseInt(String(formData.runtime)) <= 0);
    }

    if (Object.values(newErrors).some((v) => v)) {
      setErrors(newErrors);
      setErrorTrigger((p) => p + 1);
      showToast(MESSAGES.COMMON.REQUIRED_FIELDS, 'error');
      return false;
    }
    setErrors(newErrors);

    if (status === 'history' && formData.rating === 0) {
      setRatingError(true);
      setErrorTrigger((p) => p + 1);
      showToast(MESSAGES.MOVIE.REQUIRED_RATING, 'error');
      return false;
    }

    return true;
  };

  return {
    ratingError,
    setRatingError,
    errors,
    setErrors,
    errorTrigger,
    setErrorTrigger,
    isAnimating,
    refs,
    clearErrors,
    validate,
  };
};
