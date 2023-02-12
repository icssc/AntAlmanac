import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Paper, Typography } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { School } from '$types/peterportal';

interface Props {
  school: School;
}

/**
 * renders a School for list of course search results
 */
export default function SchoolDeptCard({ school }: Props) {
  return (
    <Grid item xs={12}>
      <Paper elevation={1} square>
        <Accordion sx={{ padding: 0 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" fontWeight="semi-bold">
              {school?.schoolName}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{school?.schoolComment ? 'Comments: ' : 'No comments found'}</Typography>
            <Box sx={{ fontSize: 12 }} dangerouslySetInnerHTML={{ __html: school?.schoolComment }} />
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Grid>
  );
}
