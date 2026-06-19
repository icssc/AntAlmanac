import { type RefObject, useEffect, useRef } from 'react';

export function useAnimatedHeight(ref: RefObject<HTMLElement | null>) {
  const previousHeight = useRef<number | null>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const borderSize = Array.isArray(entry.borderBoxSize) ? entry.borderBoxSize[0] : entry.borderBoxSize;
        const rawHeight = borderSize?.blockSize ?? entry.contentRect.height;
        const newHeight = Math.round(rawHeight);
        const oldHeight = previousHeight.current;

        if (isAnimating.current) {
          previousHeight.current = newHeight;
          return;
        }

        if (oldHeight !== null && Math.abs(oldHeight - newHeight) > 1) {
          isAnimating.current = true;
          el.style.height = `${oldHeight}px`;
          requestAnimationFrame(() => {
            el.style.height = `${newHeight}px`;
            const onTransitionEnd = (event: TransitionEvent) => {
              if (event.propertyName !== 'height') return;
              previousHeight.current = newHeight;
              el.style.height = '';
              isAnimating.current = false;
              el.removeEventListener('transitionend', onTransitionEnd);
            };
            el.addEventListener('transitionend', onTransitionEnd);
          });
          previousHeight.current = newHeight;
        } else {
          previousHeight.current = newHeight;
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}
