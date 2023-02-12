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

/**
 * params needed to query websoc
 */
interface Params {
  department: FormValues['deptValue'];
  term: FormValues['term'];
  ge: FormValues['ge'];
  courseNumber: FormValues['courseNumber'];
  sectionCodes: FormValues['sectionCode'];
  instructorName: FormValues['instructor'];
  units: FormValues['units'];
  endTime: FormValues['endTime'];
  startTime: FormValues['startTime'];
  fullCourses: FormValues['coursesFull'];
  building: FormValues['building'];
  room: FormValues['room'];
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

interface SearchStore {
  form: FormValues;
  setField: (field: keyof FormValues, value: string) => void;
  showResults: boolean;
  setShowResults: (showResults: boolean) => void;
  reset: () => void;
  getParams: () => Params;
  resetFields: (fields: (keyof FormValues)[]) => void;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  form: structuredClone(defaultFormValues),

  showResults: false,

  setShowResults(showResults) {
    set({ showResults });
  },

  setField(field, value) {
    const currentFormValues = get().form;
    set({ form: { ...currentFormValues, [field]: value } });
  },

  reset() {
    set({ form: structuredClone(defaultFormValues) });
  },

  resetFields(fields) {
    const formData = get().form;
    fields.forEach((field) => {
      formData[field] = defaultFormValues[field];
    });
    set({ form: formData });
  },

  getValue() {
    return get();
  },

  getParams() {
    const formData = get().form;
    const params = {
      department: formData.deptValue,
      term: formData.term,
      ge: formData.ge,
      courseNumber: formData.courseNumber,
      sectionCodes: formData.sectionCode,
      instructorName: formData.instructor,
      units: formData.units,
      endTime: formData.endTime,
      startTime: formData.startTime,
      fullCourses: formData.coursesFull,
      building: formData.building,
      room: formData.room,
    };
    return params;
  },
}));
