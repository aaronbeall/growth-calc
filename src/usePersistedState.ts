import { useCallback, useState } from "react";

type Setter<T> = T | ((prev: T) => T);

type UsePersistedStateReturn<T> = [T, (value: Setter<T>) => void];

const usePersistedState = <T,>(initialValue: T, storageKey: string): UsePersistedStateReturn<T> => {
  const getInitialValue = () => {
    if (typeof window === "undefined") return initialValue;

    const storedValue = window.localStorage.getItem(storageKey);
    if (storedValue === null) return initialValue;

    try {
      return JSON.parse(storedValue) as T;
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState<T>(getInitialValue);

  const setPersistedValue = useCallback((nextValue: Setter<T>) => {
    setValue((previous) => {
      const resolvedValue = typeof nextValue === "function" ? (nextValue as (prev: T) => T)(previous) : nextValue;

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(resolvedValue));
        } catch {
          // ignore localStorage write failures
        }
      }

      return resolvedValue;
    });
  }, [storageKey]);

  return [value, setPersistedValue];
};

export default usePersistedState;
