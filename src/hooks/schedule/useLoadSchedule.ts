import { useSnackbar } from 'notistack';
import { UserData } from '../../types';
import { getCoursesData } from '$lib/helpers';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { useScheduleStore } from '$lib/stores/schedule';
import { LOAD_DATA_ENDPOINT } from '$lib/endpoints';

export async function useLoadSchedule(userID: string, rememberMe: boolean) {
  // get current state of store
  const loadSchedule = useScheduleStore((state) => state.loadSchedule);
  const unsavedChanges = useScheduleStore((state) => state.unsavedChanges);

  // prepare the snackbar hook
  const { enqueueSnackbar } = useSnackbar();

  logAnalytics({
    category: analyticsEnum.nav.title,
    action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
    label: userID,
    value: rememberMe ? 1 : 0,
  });

  /**
   * if no user ID or the user has unsaved changes and cancels the confirmation dialog
   */
  if (
    userID == null ||
    (unsavedChanges && !window.confirm(`Are you sure you want to load a different schedule? You have unsaved changes!`))
  ) {
    return;
  }

  userID = userID.replace(/\s+/g, '');

  if (userID.length === 0) {
    return;
  }

  if (rememberMe) {
    window.localStorage.setItem('userID', userID);
  } else {
    window.localStorage.removeItem('userID');
  }

  try {
    const response_data = await fetch(LOAD_DATA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID: userID }),
    });
    if (response_data.status === 404) {
      enqueueSnackbar(`Couldn't find schedules for username "${userID}".`, {
        variant: 'error',
      });
      return;
    }
    const json = (await response_data.json()) as { userData: UserData };
    const courseData = await getCoursesData(json.userData);
    loadSchedule(courseData);
    enqueueSnackbar(`Schedule loaded for username "${userID}".`, {
      variant: 'success',
    });
  } catch (e) {
    console.error(e);
    enqueueSnackbar(`Unknown error occurred while loading schedule for username "${userID}".`, {
      variant: 'error',
    });
  }
}
