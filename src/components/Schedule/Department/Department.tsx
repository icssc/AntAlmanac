import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Paper, Typography } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import type { Department } from '$types/peterportal'

interface Props {
  department: Department
}

/**
 * renders an Department for list of course search results
 */
export default function DeptCard({ department }: Props) {
  return (
    <Grid item xs={12}>
      <Paper elevation={1} square>
        <Accordion sx={{ padding: 0 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{`Department of ${department.deptName}`}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{department.deptComment ? 'Comments: ' : 'No comments found'}</Typography>
            <Box sx={{ fontSize: 12 }} dangerouslySetInnerHTML={{ __html: department.deptComment }} />
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Grid>
  )
}
