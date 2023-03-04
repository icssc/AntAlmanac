import { useState } from 'react'
import { Box } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import trpc from '$lib/trpc'
import { useScheduleStore } from '$stores/schedule'

export default function Home() {
  const utils = trpc.useContext()
  const schedules = useScheduleStore((s) => s.schedules)
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const res = await utils.schedule.find.fetch('rem')
    useScheduleStore.setState(res)
    setLoading(false)
  }

  return (
    <Box sx={{ whiteSpace: 'pre' }}>
      <LoadingButton onClick={handleClick} loading={loading}>Load Schedule</LoadingButton>
      {JSON.stringify(schedules, null, 2)}
    </Box>
  )
}
