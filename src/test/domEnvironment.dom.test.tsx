// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('DOM test environment', () => {
  it('renders React components with jest-dom matchers', () => {
    render(<button type="button">Mở</button>);

    expect(screen.getByRole('button', { name: 'Mở' })).toBeInTheDocument();
  });
});
