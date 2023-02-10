import { Button } from '@mui/material'
import Header from '$components/Header';
import Actions from '$components/Actions';
import { useScheduleStore } from '$stores/schedule';
import { setScheduleIndex } from '$stores/schedule/schedule'

/**
 * home page
 */
export default function Home() {
  const { scheduleIndex } = useScheduleStore()

  function handleClick() {
    setScheduleIndex(scheduleIndex + 1)
  }

  return (
    <>
      <Header />
      <Actions />
      <Button onClick={handleClick} variant="contained">Increment Schedule Index</Button>
    </>
  );
}
