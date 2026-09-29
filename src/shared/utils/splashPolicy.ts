export type SplashMode = 'none' | 'static' | 'animated';

export const getSplashMode = (reducedMotion: boolean): SplashMode => {
  return reducedMotion ? 'static' : 'animated';
};
