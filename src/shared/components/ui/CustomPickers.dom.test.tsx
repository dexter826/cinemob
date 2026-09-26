// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CustomDatePicker from './CustomDatePicker';
import CustomTimePicker from './CustomTimePicker';

function stubMediaQuery(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));
}

describe('custom date and time pickers', () => {
  it('desktop picker closes on Escape and restores trigger focus', async () => {
    stubMediaQuery(false);
    const user = userEvent.setup();
    render(<CustomDatePicker id="date" value="2026-09-26" onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: '26/9/2026' });

    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Chọn ngày' })).toBeInTheDocument();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Chọn ngày' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('mobile picker uses the shared dialog focus lifecycle', async () => {
    stubMediaQuery(true);
    const user = userEvent.setup();
    render(<CustomTimePicker id="time" value="12:30" onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: /12:30/ });

    await user.click(trigger);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'time-title');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
