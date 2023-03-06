import { Box, Link, List, ListItem, Paper, Typography } from '@mui/material'

export default function HelpBox() {
  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Typography variant="h6">Need help planning your schedule?</Typography>
      <List component="ol" sx={{ listStyleType: 'disk', pl: 4 }}>
        <ListItem sx={{ display: 'list-item', p: 0 }}>
          Browse undergraduate majors on the{' '}
          <Link href="https://catalogue.uci.edu/undergraduatedegrees/" target="_blank" rel="noopener noreferrer">
            UCI Catalogue
          </Link>
          .
        </ListItem>
        <ListItem sx={{ display: 'list-item', p: 0 }}>Select your major.</ListItem>
        <ListItem sx={{ display: 'list-item', p: 0 }}>
          View the &quot;REQUIREMENTS&quot; and &quot;SAMPLE PROGRAM&quot; tabs to see what classes you should take.
        </ListItem>
      </List>
      <Box sx={{ display: 'flex', gap: 10, overflow: 'auto' }}>
        <Box
          component="img"
          src="/helpbox/1.png"
          height={250}
          alt='UCI General Catalogue with "Explore Undergraduate Programs" button highlighted'
        />
        <Box src="/helpbox/2.png" component="img" height={250} alt="Undergraduate Majors and Minors page" />
        <Box
          component="img"
          height={250}
          src="/helpbox/3.png"
          alt='Electrical Engineering page with "REQUIREMENTS" and "SAMPLE PROGRAM" tabs highlighted'
        />
      </Box>
    </Paper>
  )
}
