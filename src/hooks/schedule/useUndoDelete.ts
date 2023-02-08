import { useSnackbar } from 'notistack';
import { useScheduleStore } from '$lib/stores/schedule';
import useAddCourse from './useAddCourse';

export function useUndoDelete(event: KeyboardEvent | null) {
  const deletedCourses = useScheduleStore((state) => state.deletedCourses);
  const undoDelete = useScheduleStore((state) => state.undoDelete);
  const addCourse = useAddCourse();
  const { enqueueSnackbar } = useSnackbar();

  if (deletedCourses.length > 0 && (event == null || (event.keyCode === 90 && (event.ctrlKey || event.metaKey)))) {
    const lastDeleted = deletedCourses[deletedCourses.length - 1];

    if (lastDeleted == null) {
      return;
    }

    addCourse(lastDeleted.section, lastDeleted, lastDeleted.term, lastDeleted.scheduleIndex, lastDeleted.color);
    undoDelete(deletedCourses.slice(0, deletedCourses.length - 1));

    enqueueSnackbar(
      `Undo delete ${lastDeleted.deptCode} ${lastDeleted.courseNumber} in schedule ${lastDeleted.scheduleIndex + 1}.`,
      {
        variant: 'success',
      }
    );
  }
}
