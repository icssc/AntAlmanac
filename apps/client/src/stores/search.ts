/**
 * shared state for the course search
 */

import { create } from 'zustand'
import { getDefaultTerm } from '$lib/termData'

/**
 * all form values
 */
export interface FormValues {
  deptValue: string
  deptLabel: string
  ge: string
  term: string
  courseNumber: string
  sectionCode: string
  instructor: string
  units: string
  endTime: string
  startTime: string
  coursesFull: string
  building: string
  room: string
  fuzzy: string
}

/**
 * params needed to query websoc
 */
interface WebsocParams {
  department: FormValues['deptValue']
  term: FormValues['term']
  ge: FormValues['ge']
  courseNumber: FormValues['courseNumber']
  sectionCode: FormValues['sectionCode']
  instructorName: FormValues['instructor']
  units: FormValues['units']
  endTime: FormValues['endTime']
  startTime: FormValues['startTime']
  fullCourses: FormValues['coursesFull']
  building: FormValues['building']
  room: FormValues['room']
}

/**
 * empty form
 */
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
  fuzzy: '',
}

/**
 * interface for the search store
 */
interface SearchStore {
  /**
   * current form values
   */
  form: FormValues

  /**
   * set a field in the form
   */
  setField: (field: keyof FormValues, value: string) => void

  /**
   * whether the website should render the search results
   */
  showResults: boolean

  /**
   * set whether the website should render the search results
   */
  setShowResults: (showResults: boolean) => void

  /**
   * convert the form values to appropriate websoc params
   */
  getParams: () => WebsocParams

  /**
   * reset the entire form
   */
  reset: () => void

  /**
   * reset only provided fields of the form
   */
  resetFields: (fields: (keyof FormValues)[]) => void
}

/**
 * hook to access the shared search store
 */
export const useSearchStore = create<SearchStore>((set, get) => ({
  form: structuredClone(defaultFormValues),

  showResults: false,

  setShowResults(showResults) {
    set({ showResults })
  },

  setField(field, value) {
    const currentState = get()
    const currentFormValues = currentState.form
    set({ form: { ...currentFormValues, [field]: value } })
  },

  reset() {
    set({ form: structuredClone(defaultFormValues) })
  },

  resetFields(fields) {
    const currentState = get()
    const { form } = currentState
    fields.forEach((field) => {
      form[field] = defaultFormValues[field]
    })
    set({ form })
  },

  getParams() {
    const currentState = get()
    const { form } = currentState
    const params = {
      department: form.deptValue,
      term: form.term,
      ge: form.ge,
      courseNumber: form.courseNumber,
      sectionCode: form.sectionCode,
      instructorName: form.instructor,
      units: form.units,
      endTime: form.endTime,
      startTime: form.startTime,
      fullCourses: form.coursesFull,
      building: form.building,
      room: form.room,
    }
    return params
  },
}))
