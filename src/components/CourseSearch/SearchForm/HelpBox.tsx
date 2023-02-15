import { Box, Link, List, ListItem, Paper, Typography } from '@mui/material'

export default function HelpBox() {
  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Typography variant="h5">Need help planning your schedule?</Typography>
      <List>
        <ListItem sx={{ display: 'block' }}>
          Browse undergraduate majors on the{' '}
          <Link
            href="https://catalogue.uci.edu/undergraduatedegrees/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            UCI Catalogue
          </Link>
          .
        </ListItem>
        <ListItem>Select your major.</ListItem>
        <ListItem>
          View the &quot;REQUIREMENTS&quot; and &quot;SAMPLE PROGRAM&quot; tabs to see what classes you should take.
        </ListItem>
      </List>
      <Box sx={{ display: 'flex', gap: 2, overflow: 'auto' }}>
        <img
          src="/helpbox/1.png"
          height="250"
          alt='UCI General Catalogue with "Explore Undergraduate Programs" button highlighted'
        />
        <img src="/helpbox/2.png" height="250" alt="Undergraduate Majors and Minors page" />
        <img
          height="250"
          src="/helpbox/2.png"
          alt='Electrical Engineering page with "REQUIREMENTS" and "SAMPLE PROGRAM" tabs highlighted'
        />
      </Box>
    </Paper>
  )
}
