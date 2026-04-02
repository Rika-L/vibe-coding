import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (className merge utility)', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz');
    expect(result).toBe('foo baz');
  });

  it('should handle array input', () => {
    const result = cn(['foo', 'bar']);
    expect(result).toBe('foo bar');
  });

  it('should handle object input for conditional classes', () => {
    const result = cn('foo', { bar: true, baz: false });
    expect(result).toBe('foo bar');
  });

  it('should handle mixed input', () => {
    const result = cn('foo', ['bar', 'baz'], { qux: true });
    expect(result).toBe('foo bar baz qux');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle null and undefined', () => {
    const result = cn('foo', null, undefined, 'bar');
    expect(result).toBe('foo bar');
  });

  it('should merge tailwind classes correctly', () => {
    const result = cn('px-2 py-2', 'px-4');
    // tailwind-merge should keep the last class for conflicting prefixes
    expect(result).toContain('py-2');
    expect(result).toContain('px-4');
  });
});
