import { useState, useCallback } from 'react';

interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (value: number) => void;
}

export const useCounter = (initialValue: number = 0): UseCounterReturn => {
  const [count, setCount] = useState<number>(initialValue);

  const increment = useCallback((): void => {
    setCount((prev: number) => prev + 1);
  }, []);

  const decrement = useCallback((): void => {
    setCount((prev: number) => prev - 1);
  }, []);

  const reset = useCallback((): void => {
    setCount(initialValue);
  }, [initialValue]);

  const setValue = useCallback((value: number): void => {
    setCount(value);
  }, []);

  return {
    count,
    increment,
    decrement,
    reset,
    setCount: setValue,
  };
};
