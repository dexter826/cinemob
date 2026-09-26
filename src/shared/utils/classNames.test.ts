import { describe, expect, it } from 'vitest';
import { classNames } from './classNames';

describe('classNames', () => {
  it('keeps truthy classes in order', () => {
    expect(classNames('base', false, undefined, 'active', null, 'compact')).toBe('base active compact');
  });
});
