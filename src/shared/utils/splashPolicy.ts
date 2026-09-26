export type SplashMode = 'none' | 'static' | 'animated';

export const getSplashMode = (pathname: string, reducedMotion: boolean): SplashMode => {
  if (pathname.startsWith('/share/')) return 'none';
  return reducedMotion ? 'static' : 'animated';
};
