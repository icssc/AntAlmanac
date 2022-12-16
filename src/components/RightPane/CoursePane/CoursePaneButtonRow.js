import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Tooltip } from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { withStyles } from '@mui/styles';

const styles = {
    buttonRow: {
        width: '100%',
        zIndex: 3,
        marginBottom: 8,
        position: 'absolute',
        pointerEvents: 'none',
    },
    button: {
        backgroundColor: 'rgba(236, 236, 236, 1)',
        marginRight: 5,
        boxShadow: 2,
        color: 'black',
        '&:hover': {
            backgroundColor: 'grey',
        },
        pointerEvents: 'auto',
    },
};

class CoursePaneButtonRow extends PureComponent {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.buttonRow} style={{ display: this.props.showSearch ? 'block' : 'none' }}>
                <Tooltip title="Back">
                    <IconButton onClick={this.props.onDismissSearchResults} className={classes.button} size="large">
                        <ArrowBack />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Refresh Search Results">
                    <IconButton onClick={this.props.onRefreshSearch} className={classes.button} size="large">
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </div>
        );
    }
}

CoursePaneButtonRow.propTypes = {
    showSearch: PropTypes.bool.isRequired,
    onDismissSearchResults: PropTypes.func.isRequired,
};

export default withStyles(styles)(CoursePaneButtonRow);
