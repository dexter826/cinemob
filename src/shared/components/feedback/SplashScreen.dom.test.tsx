// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SplashScreen from './SplashScreen';

vi.mock('lottie-react', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <button type="button" onClick={onComplete}>Hoàn tất splash</button>
  ),
}));

vi.mock('@/assets/images/logo_text.png', () => ({ default: 'logo.png' }));

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

describe('SplashScreen lifecycle', () => {
  it('does not treat an aborted asset request as a completed splash', async () => {
    fetchMock.mockRejectedValueOnce(new DOMException('The operation was aborted.', 'AbortError'));
    const onAnimationFinish = vi.fn();

    render(<SplashScreen onAnimationFinish={onAnimationFinish} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(onAnimationFinish).not.toHaveBeenCalled();
  });

  it('does not render data loading inside the static brand frame', () => {
    const onAnimationFinish = vi.fn();

    render(
      <SplashScreen
        onAnimationFinish={onAnimationFinish}
        staticMode
      />
    );

    expect(screen.getByAltText('CineMOB')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(onAnimationFinish).toHaveBeenCalledOnce();
  });
});
