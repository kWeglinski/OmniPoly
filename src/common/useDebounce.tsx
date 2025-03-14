import { useState, useEffect } from "react";

export const useDebounce = (value: unknown, milliSeconds: number, cb?: unknown) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      if (typeof cb === 'function') {
        cb();
      }
    }, milliSeconds);

    return () => {
      clearTimeout(handler);
    };
  }, [value, milliSeconds, cb]);

  return debouncedValue;
};
