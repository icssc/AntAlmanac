import React, { Component, Fragment } from 'react';
import {
  Grid,
  Paper,
  Typography,
  withStyles,
  Collapse,
} from '@material-ui/core';
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

class SchoolDeptCard extends Component {
  constructor(props) {
    super(props);
    this.state = { commentsOpen: false };
  }

  render() {
    const html = { __html: [this.props.comment] };

    return (
      <Grid item xs={12}>
        <Paper
          className={this.props.classes[this.props.type]}
          elevation={1}
          square
        >
          <Typography
            noWrap
            variant={this.props.type === 'school' ? 'headline' : 'subheading'}
            className={this.props.classes.text}
          >
            {this.props.name}
          </Typography>
          <Fragment>
            <Subject
              onClick={() =>
                this.setState({ commentsOpen: !this.state.commentsOpen })
              }
              className={this.props.classes.icon}
            />

            <Collapse
              in={this.state.commentsOpen}
              className={this.props.classes.collapse}
            >
              <Typography variant="body2">
                {this.props.comment === '' ? 'No comments found' : 'Comments:'}
              </Typography>
              <div
                dangerouslySetInnerHTML={html}
                className={this.props.classes.comments}
              />
            </Collapse>
          </Fragment>
        </Paper>
      </Grid>
    );
  }
}

//TODO: Find an efficient alternative to dangerouslySetInnerHTML because it exposes us to XSS in the highly unlikely event that WebSOC is compromised and sends malicious code

export default withStyles(styles)(SchoolDeptCard);
