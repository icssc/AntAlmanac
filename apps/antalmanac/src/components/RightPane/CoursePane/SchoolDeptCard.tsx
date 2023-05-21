import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Paper, Theme, Typography, withStyles } from '@material-ui/core';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { ExpandMore } from '@material-ui/icons';
import { PureComponent } from 'react';

const styles: Styles<Theme, object> = (theme) => ({
    school: {
        display: 'flex',
        flexWrap: 'wrap',
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing(),
        paddingBottom: theme.spacing(),
    },
    dept: {
        display: 'flex',
        flexWrap: 'wrap',
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing(),
        paddingBottom: theme.spacing(),
    },
    text: {
        flexBasis: '50%',
        flexGrow: 1,
        display: 'inline',
        cursor: 'pointer',
    },
    icon: {
        cursor: 'pointer',
    },
    collapse: {
        flexBasis: '100%',
    },
    comments: {
        fontFamily: 'Roboto',
        fontSize: 12,
    },
});

interface SchoolDeptCardProps {
    classes: ClassNameMap;
    comment: string;
    name: string;
    type: string;
}

class SchoolDeptCard extends PureComponent<SchoolDeptCardProps> {
    state = { commentsOpen: false };

    render() {
        const html = { __html: this.props.comment };
        return (
            <Grid item xs={12}>
                <Paper elevation={1} square>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography 
                                variant={this.props.type === 'school' ? 'h6' : 'subtitle1'}
                            >
                                {this.props.name}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                                <Typography variant="body2">
                                    {this.props.comment === '' ? 'No comments found' : 'Comments:'}
                                    <Box dangerouslySetInnerHTML={html} className={this.props.classes.comments} />
                                </Typography>
                        </AccordionDetails>
                    </Accordion>
                </Paper>
            </Grid>
        );
    }
}

export default withStyles(styles)(SchoolDeptCard);