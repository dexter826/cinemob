// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CustomDropdown from './CustomDropdown';

const options = [
  { value: 'movie', label: 'Phim lẻ' },
  { value: 'tv', label: 'Phim bộ' },
];

describe('CustomDropdown keyboard model', () => {
  it('forwards form associations and supports focus-based keyboard selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <span id="media-label">Loại phim</span>
        <span id="media-help">Chọn một loại</span>
        <CustomDropdown
          id="media-type"
          aria-labelledby="media-label"
          aria-describedby="media-help"
          aria-invalid="true"
          options={options}
          value={null}
          onChange={onChange}
          searchable
        />
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Loại phim' });
    expect(trigger).toHaveAttribute('id', 'media-type');
    expect(trigger).toHaveAttribute('aria-describedby', 'media-help');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');

    await user.click(trigger);
    const search = screen.getByRole('textbox');
    expect(search).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Phim lẻ' })).toHaveFocus();
    await user.keyboard('{End}{Enter}');

    expect(onChange).toHaveBeenCalledWith('tv');
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
