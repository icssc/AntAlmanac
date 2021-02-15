import React, { PureComponent, Fragment } from 'react';
import { Grid, Paper, Typography, withStyles, Collapse } from '@material-ui/core';
import { Subject } from '@material-ui/icons';

const styles = (theme) => ({
    school: {
        display: 'flex',
        flexWrap: 'wrap',
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
    },
    dept: {
        display: 'flex',
        flexWrap: 'wrap',
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
    },
    text: {
        flexBasis: '50%',
        flexGrow: '1',
        display: 'inline',
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

class SchoolDeptCard extends PureComponent {
    state = { commentsOpen: false };

    render() {
        const html = { __html: [this.props.comment] };

        return (
            <Grid item xs={12}>
                <Paper className={this.props.classes[this.props.type]} elevation={1} square>
                    <Typography
                        noWrap
                        variant={this.props.type === 'school' ? 'h6' : 'subtitle1'}
                        className={this.props.classes.text}
                    >
                        {this.props.name}
                    </Typography>
                    <Fragment>
                        <Subject
                            onClick={() =>
                                this.setState({
                                    commentsOpen: !this.state.commentsOpen,
                                })
                            }
                            className={this.props.classes.icon}
                        />

                        <Collapse in={this.state.commentsOpen} className={this.props.classes.collapse}>
                            <Typography variant="body2">
                                {this.props.comment === '' ? 'No comments found' : 'Comments:'}
                            </Typography>
                            <div dangerouslySetInnerHTML={html} className={this.props.classes.comments} />
                        </Collapse>
                    </Fragment>
                </Paper>
            </Grid>
        );
    }
}

export default withStyles(styles)(SchoolDeptCard);
