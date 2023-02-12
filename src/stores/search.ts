import { create } from 'zustand';
import { getDefaultTerm } from '$lib/termData';

interface FormValues {
  deptValue: string;
  deptLabel: string;
  ge: string;
  term: string;
  courseNumber: string;
  sectionCode: string;
  instructor: string;
  units: string;
  endTime: string;
  startTime: string;
  coursesFull: string;
  building: string;
  room: string;
}

const defaultFormValues: FormValues = {
  deptValue: 'ALL',
  deptLabel: 'ALL: Include All Departments',
  ge: 'ANY',
  term: getDefaultTerm().shortName,
  courseNumber: '',
  sectionCode: '',
  instructor: '',
  units: '',
  endTime: '',
  startTime: '',
  coursesFull: 'ANY',
  building: '',
  room: '',
};

interface SearchStore extends FormValues {
  setField: (field: keyof SearchStore, value: string) => void;
  reset: () => void;
  value: () => FormValues;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  ...structuredClone(defaultFormValues),

  setField(field, value) {
    set({ [field]: value });
  },

  reset() {
    set(structuredClone(defaultFormValues));
  },

  value() {
    return get();
  },
}));
