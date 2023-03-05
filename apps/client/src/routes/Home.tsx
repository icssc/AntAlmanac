import './Home.css'

import Split from 'react-split'
import { Box, useTheme } from '@mui/material'
import Calendar from '$components/Calendar'

export default function Home() {
  const theme = useTheme()
  return (
    <Split
      sizes={[50, 50]}
      minSize={100}
      gutterSize={10}
      gutterAlign="center"
      snapOffset={30}
      direction="horizontal"
      cursor="col-resize"
      style={{ display: 'flex', height: 'calc(100vh - 64px)' }}
      gutterStyle={() => ({ backgroundColor: theme.palette.primary.main, width: '10px' })}
    >
      <Box sx={{ overflowY: 'auto' }}>
        <Calendar />
      </Box>

      <Box>Hi</Box>
    </Split>
  )
}
