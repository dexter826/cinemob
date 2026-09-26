import { describe, expect, it } from 'vitest';
import { DIALOG_VARIANTS, MOTION_DURATION, OVERLAY_VARIANTS } from './animations';

describe('motion contract', () => {
  it('keeps dialog movement small and never scales the dialog', () => {
    expect(DIALOG_VARIANTS.closed).toMatchObject({ opacity: 0, y: 8 });
    expect(DIALOG_VARIANTS.open).toMatchObject({ opacity: 1, y: 0 });
    expect(DIALOG_VARIANTS.closed).not.toHaveProperty('scale');
    expect(DIALOG_VARIANTS.open).not.toHaveProperty('scale');
  });

  it('uses bounded motion durations', () => {
    expect(MOTION_DURATION.fast).toBeGreaterThanOrEqual(0.12);
    expect(MOTION_DURATION.deliberate).toBeLessThanOrEqual(0.3);
    expect(OVERLAY_VARIANTS.closed).toEqual({ opacity: 0 });
  });
});
