import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Paper, Typography } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

interface Props {
  name: string;
  comment: string;
}

export default function SchoolDeptCard(props: Props) {
  const html = { __html: props.comment };
  const status = props.comment ? 'Comments: ' : 'No comments found';

  return (
    <Grid item xs={12}>
      <Paper elevation={1} square>
        <Accordion sx={{ padding: 0 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{props.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{status}</Typography>
            <Box sx={{ fontSize: 12 }} dangerouslySetInnerHTML={html} />
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Grid>
  );
}
