import { create } from 'zustand';
import { getDefaultTerm } from '$lib/termData';

interface TermStore {
  /**
   * the currently selected term
   */
  term: string;

  /**
   * change the currently selected term
   * @param term the new term to select
   */
  setTerm: (term: string) => void;

  /**
   * reset the selected term
   */
  resetTerm: () => void;
}

export const useTermStore = create<TermStore>((set) => ({
  term: getDefaultTerm().shortName,

  setTerm(term: string) {
    set(() => ({ term }));
  },

  resetTerm() {
    set(() => ({ term: getDefaultTerm().shortName }));
  },
}));
