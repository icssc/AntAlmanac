import AppBar from './AppBar';
import ActionsBar from './ActionsBar';
import { useScheduleStore } from '$lib/stores/schedule'
import useAddCustomEvent from '$hooks/schedule/useAddCustomEvent';
import { Button } from '@mui/material'

/**
 * home page for desktop
 *
 * DEMO
 */
export default function Home() {
  /**
   * import the custom store action hook; it returns a function that does whatever is after "use"
   * e.g. "useAddCustomEvent" returns a function that "addCustomEvent"
   */
  const addCustomEvent = useAddCustomEvent()

  /**
   * DEMO: reactive just works!
   *
   * extended DEMO: subscribe to the store in a different component
   */
  const customEvents = useScheduleStore(state => state.customEvents)

  /**
   * call the function that was returned by the custom action hook
   */
  function handleClick() {
    console.log('clicked')
    addCustomEvent({
      title: 'hi',
      start: 'asdf',
      end: 'asdf',
      customEventID: 69,
      days: [false],
      scheduleIndices: [0]
    })
  }

  return (
    <>
      {JSON.stringify(customEvents)}
      <AppBar />
      <ActionsBar />
      <Button onClick={handleClick}>CLICK ME</Button>
    </>
  );
}
