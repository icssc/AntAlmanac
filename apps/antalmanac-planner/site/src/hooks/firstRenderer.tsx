// Grabbed from https://stackoverflow.com/questions/53253940/make-react-useeffect-hook-not-run-on-initial-render

import { useRef, useEffect } from 'react';

export function useFirstRender() {
  const firstRender = useRef(true);

  useEffect(() => {
    firstRender.current = false;
  }, []);

  return firstRender.current;
}
