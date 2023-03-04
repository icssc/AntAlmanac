import { Box } from '@mui/material'
import trpc from '$lib/trpc'
export default function Home() {
  const query = trpc.schedule.find.useQuery('rem')
  return (
    <Box sx={{ whiteSpace: 'pre' }}>
      {JSON.stringify(query.data, null, 2)}
    </Box>
  )
}
