import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, expect } from 'vitest';

import useLocalStorage from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const cases = [
    {
      name: 'numbers',
      initial: 7,
      next: 11,
      fallback: 0,
    },
    {
      name: 'arrays',
      initial: [1, 2, 3],
      next: [4, 5],
      fallback: [],
    },
    {
      name: 'objects',
      initial: { a: 1 },
      next: { b: 2 },
      fallback: {},
    },
  ];

  it.each(cases)('persists $name in localStorage', async ({ name, initial, next, fallback }) => {
    const key = `use-local-storage-${name}`;

    const { result } = renderHook(
      ({ initialValue }: { initialValue: any }) =>
        useLocalStorage<any>(key, initialValue),
      {
        initialProps: { initialValue: initial },
      },
    );

    await waitFor(() => {
      expect(window.localStorage.getItem(key)).toBe(JSON.stringify(initial));
    });
    expect(result.current[0]).toEqual(initial);

    act(() => {
      result.current[1](next);
    });

    await waitFor(() => {
      expect(window.localStorage.getItem(key)).toBe(JSON.stringify(next));
    });
    expect(result.current[0]).toEqual(next);

    const hydration = renderHook(() => useLocalStorage<any>(key, fallback));
    expect(hydration.result.current[0]).toEqual(next);
  });
});
