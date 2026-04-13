import { useRef, useCallback } from "react";

interface UseCompositionOptions<T extends HTMLElement> {
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (e: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (e: React.CompositionEvent<T>) => void;
}

export function useComposition<T extends HTMLElement>(
  options: UseCompositionOptions<T> = {}
) {
  const composingRef = useRef(false);
  const onCompositionStart = useCallback((e: React.CompositionEvent<T>) => {
    composingRef.current = true;
    options.onCompositionStart?.(e);
  }, [options.onCompositionStart]);
  const onCompositionEnd = useCallback((e: React.CompositionEvent<T>) => {
    composingRef.current = false;
    options.onCompositionEnd?.(e);
  }, [options.onCompositionEnd]);
  const onKeyDown = useCallback((e: React.KeyboardEvent<T>) => {
    if (composingRef.current) return;
    options.onKeyDown?.(e);
  }, [options.onKeyDown]);
  return { composing: composingRef.current, onCompositionStart, onCompositionEnd, onKeyDown };
}
