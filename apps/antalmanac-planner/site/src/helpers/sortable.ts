import { ReactSortableProps, SortableOptions } from 'react-sortablejs';
import { CourseGQLData } from '../types/types';

const baseSortable: SortableOptions = {
  animation: 150,
  forceFallback: true,
  fallbackOnBody: true,
  fallbackTolerance: 4,
};

export const quarterSortable: SortableOptions & Partial<ReactSortableProps<CourseGQLData>> = {
  ...baseSortable,
  setList: () => {},
  handle: '.course-drag-handle',
  group: { name: 'courses' },
};

export const courseSearchSortable: SortableOptions & Partial<ReactSortableProps<CourseGQLData>> = {
  ...baseSortable,
  setList: () => {},
  sort: false,
  revertOnSpill: true,
  handle: '.course-drag-handle',
  group: { name: 'courses', pull: 'clone', put: false },
};

export const programRequirementsSortable: SortableOptions & Partial<ReactSortableProps<{ id: string }>> = {
  ...baseSortable,
  setList: () => {},
  sort: false,
  revertOnSpill: true,
  group: { name: 'courses', pull: 'clone', put: false },
};
