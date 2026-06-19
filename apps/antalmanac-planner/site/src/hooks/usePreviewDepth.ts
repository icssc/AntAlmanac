import { useEffect, useRef, useState } from 'react';

export function usePreviewDepth() {
  const depthRef = useRef(0);
  const [previewDepth, setPreviewDepth] = useState(0);

  useEffect(() => {
    const original = history.pushState.bind(history);
    history.pushState = function (...args: Parameters<typeof history.pushState>) {
      const urlArg = args[2];
      if (urlArg != null) {
        const url = new URL(urlArg.toString(), window.location.href);
        const newDepth =
          url.searchParams.has('course') || url.searchParams.has('instructor') ? depthRef.current + 1 : 0;
        depthRef.current = newDepth;
        args[0] = { ...args[0], __previewDepth: newDepth };
        queueMicrotask(() => setPreviewDepth(newDepth));
      }
      return original(...args);
    };
    return () => {
      history.pushState = original;
    };
  }, []);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const newDepth = e.state?.__previewDepth ?? 0;
      depthRef.current = newDepth;
      setPreviewDepth(newDepth);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return previewDepth;
}
