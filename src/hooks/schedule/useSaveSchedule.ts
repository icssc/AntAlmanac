import { useSnackbar } from 'notistack';
import { ShortCourseInfo } from '../../types';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { useScheduleStore } from '$lib/stores/schedule';
import { SAVE_DATA_ENDPOINT } from '$lib/endpoints';

export async function useSaveSchedule(userID: string, rememberMe: boolean) {
  // get the current state from the store
  const addedCourses = useScheduleStore((state) => state.addedCourses);
  const customEvents = useScheduleStore((state) => state.customEvents);
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const saveSchedule = useScheduleStore((state) => state.saveSchedule);

  // prepare the snackbar hook
  const { enqueueSnackbar } = useSnackbar();

  logAnalytics({
    category: analyticsEnum.nav.title,
    action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
    label: userID,
    value: rememberMe ? 1 : 0,
  });

  if (userID == null) {
    return;
  }

  userID = userID.replace(/\s+/g, '');

  if (userID.length > 0) {
    if (rememberMe) {
      window.localStorage.setItem('userID', userID);
    } else {
      window.localStorage.removeItem('userID');
    }
    const userData = {
      addedCourses: [] as ShortCourseInfo[],
      scheduleNames: scheduleNames,
      customEvents: customEvents,
    };

    userData.addedCourses = addedCourses.map((course) => {
      return {
        color: course.color,
        term: course.term,
        sectionCode: course.section.sectionCode,
        scheduleIndices: course.scheduleIndices,
      };
    });

    try {
      await fetch(SAVE_DATA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, userData }),
      });

      enqueueSnackbar(`Schedule saved under username "${userID}". Don't forget to sign up for classes on WebReg!`, {
        variant: 'success',
      });

      saveSchedule();
    } catch (e) {
      enqueueSnackbar(`Schedule could not be saved under username "${userID}`, {
        variant: 'error',
      });
    }
  }
}
