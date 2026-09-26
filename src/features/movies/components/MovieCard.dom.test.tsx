// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Movie } from '@/types';
import MovieCard from './MovieCard';

const movie: Movie = {
  docId: 'movie-1',
  uid: 'user-1',
  id: 1,
  title: 'Dune',
  poster_path: '',
  runtime: 155,
  watched_at: new Date('2026-01-01'),
  source: 'manual',
  media_type: 'movie',
  status: 'history',
};

describe('MovieCard', () => {
  it('select mode exposes one action and only calls onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container } = render(
      <MovieCard mode="select" movie={movie} onSelect={onSelect} />,
    );

    expect(container.querySelectorAll('button')).toHaveLength(1);
    expect(container.querySelector('button button')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /thêm phim dune vào album/i }));

    expect(onSelect).toHaveBeenCalledWith(movie);
  });

  it('keeps rating and review metadata below the title instead of stacking them on the poster', () => {
    const { container } = render(
      <MovieCard
        movie={{ ...movie, rating: 8, is_review: true }}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onClick={vi.fn()}
      />,
    );

    const posterBadges = container.querySelector('.absolute.top-2.left-2');
    expect(posterBadges).toHaveTextContent('Phim');
    expect(posterBadges).not.toHaveTextContent('8.0');
    expect(posterBadges).not.toHaveTextContent('Review');
    expect(screen.getByText('8.0')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });
});
