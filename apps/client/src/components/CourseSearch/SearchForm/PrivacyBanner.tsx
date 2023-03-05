import { Paper, Typography } from '@mui/material'

export default function PrivacyBanner() {
  return (
    <Paper variant="outlined" sx={{ padding: 1, margin: 1 }}>
      <Typography variant="body2">
        We use cookies to analyze website traffic and track usage, with the aim of improving your experience on
        AntAlmanac. By continuing to use this website, you are giving consent to store Google Analytics cookies on your
        device.
      </Typography>
    </Paper>
  )
}
