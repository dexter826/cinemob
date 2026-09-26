import { describe, expect, it } from 'vitest';
import { getSplashMode } from './splashPolicy';

describe('getSplashMode', () => {
  it('bypasses the public share route', () => {
    expect(getSplashMode('/share/user-1', false)).toBe('none');
  });

  it('plays the full animation on a normal app load', () => {
    expect(getSplashMode('/', false)).toBe('animated');
  });

  it('uses a static brand frame for reduced motion', () => {
    expect(getSplashMode('/albums', true)).toBe('static');
  });
});
