import { ExpandMore } from '@material-ui/icons';
import { Accordion, Typography, AccordionDetails, AccordionSummary, Box, Grid, Paper } from '@mui/material';

interface SchoolDeptCardProps {
    name: string;
    type: string;
    comment: string;
}

export function SchoolDeptCard({ name, type, comment }: SchoolDeptCardProps) {
    const html = { __html: comment };
    return (
        <Grid item xs={12}>
            <Paper elevation={1} square style={{ overflow: 'hidden' }}>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{ overflow: 'hidden', whiteSpace: 'nowrap', paddingX: 1, paddingY: 0 }}
                    >
                        <Typography
                            variant={type === 'school' ? 'h6' : 'subtitle1'}
                            sx={{
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {name}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ paddingX: 1, paddingY: 0 }}>
                        <Typography variant="body2" component={'span'} sx={{ fontSize: 12 }}>
                            {/*The default component for the body2 typography seems to be <p> which is giving warnings with DOMnesting */}
                            <Typography>{comment === '' ? 'No comments found' : 'Comments:'}</Typography>
                            <Box dangerouslySetInnerHTML={html} component="p" />
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Paper>
        </Grid>
    );
}
