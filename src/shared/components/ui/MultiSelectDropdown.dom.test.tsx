// @vitest-environment jsdom

import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import MultiSelectDropdown from './MultiSelectDropdown';

const options = [
  { value: 'action', label: 'Hành động' },
  { value: 'drama', label: 'Tâm lý' },
];

function Harness() {
  const [values, setValues] = useState<(string | number)[]>(['action']);
  return (
    <>
      <span id="genre-label">Thể loại</span>
      <MultiSelectDropdown
        id="genres"
        aria-labelledby="genre-label"
        options={options}
        values={values}
        onChange={setValues}
        searchable
      />
    </>
  );
}

describe('MultiSelectDropdown', () => {
  it('has no nested buttons and is fully keyboard operable', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);

    expect(container.querySelector('button button')).not.toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'Thể loại' });
    expect(trigger).toHaveAttribute('id', 'genres');
    expect(screen.getByRole('button', { name: 'Xóa tất cả lựa chọn' })).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');

    await user.keyboard('{ArrowDown}');
    const firstOption = screen.getByRole('option', { name: 'Hành động' });
    expect(firstOption).toHaveFocus();
    await user.keyboard('{End} ');
    expect(screen.getByRole('option', { name: 'Tâm lý' })).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Xóa tất cả lựa chọn' }));
    expect(screen.queryByRole('button', { name: 'Xóa tất cả lựa chọn' })).not.toBeInTheDocument();
  });
});
