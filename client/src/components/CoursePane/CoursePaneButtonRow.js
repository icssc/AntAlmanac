import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Tooltip } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const styles = {
    buttonRow: {
        width: '100%',
        zIndex: 3,
        marginBottom: 8,
    },
    button: {
        backgroundColor: 'rgba(236, 236, 236, 1)',
        marginRight: 5,
        boxShadow: 2,
    },
};

class CoursePaneButtonRow extends PureComponent {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.buttonRow} style={{ display: this.props.showSearch ? 'block' : 'none' }}>
                <Tooltip title="Back">
                    <IconButton onClick={this.props.onDismissSearchResults} className={classes.button}>
                        <ArrowBack />
                    </IconButton>
                </Tooltip>

                {/*<Tooltip title="Refresh Search Results">*/}
                {/*    <IconButton onClick={this.fetchSearch} className={classes.button}>*/}
                {/*        <Refresh />*/}
                {/*    </IconButton>*/}
                {/*</Tooltip>*/}
            </div>
        );
    }
}

CoursePaneButtonRow.propTypes = {
    showSearch: PropTypes.bool.isRequired,
    onDismissSearchResults: PropTypes.func.isRequired,
};

export default withStyles(styles)(CoursePaneButtonRow);
