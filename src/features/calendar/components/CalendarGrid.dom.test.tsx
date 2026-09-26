// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CalendarGrid from './CalendarGrid';

describe('CalendarGrid', () => {
  it('uses native day buttons with today and selected semantics', async () => {
    const user = userEvent.setup();
    const setSelectedDate = vi.fn();
    const currentDate = new Date();
    render(
      <CalendarGrid
        currentDate={currentDate}
        navigateMonth={vi.fn()}
        goToToday={vi.fn()}
        loadingEpisodes={false}
        getEpisodesForDate={() => []}
        setSelectedDate={setSelectedDate}
        selectedDate={currentDate}
      />,
    );

    const today = screen.getAllByRole('button').find(button => button.getAttribute('aria-current') === 'date');
    expect(today).toHaveAttribute('aria-pressed', 'true');
    await user.click(today!);
    expect(setSelectedDate).toHaveBeenCalled();
  });
});
