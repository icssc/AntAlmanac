import React, { PureComponent } from 'react';
import {IconButton, Theme, Tooltip} from '@material-ui/core';
import { ArrowBack, Refresh } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import {ClassNameMap} from "@material-ui/core/styles/withStyles";
import {Styles} from "@material-ui/core/styles/withStyles";

const styles: Styles<Theme, object> = {
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
        boxShadow: "2",
        color: 'black',
        '&:hover': {
            backgroundColor: 'grey',
        },
        pointerEvents: 'auto',
    },
};

interface CoursePaneButtonRowProps {
    classes: ClassNameMap;
    showSearch: boolean;
    onDismissSearchResults: () => void;
    onRefreshSearch: () => void;
}

class CoursePaneButtonRow extends PureComponent<CoursePaneButtonRowProps> {
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.buttonRow} style={{ display: this.props.showSearch ? 'block' : 'none' }}>
                <Tooltip title="Back">
                    <IconButton onClick={this.props.onDismissSearchResults} className={classes.button}>
                        <ArrowBack />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Refresh Search Results">
                    <IconButton onClick={this.props.onRefreshSearch} className={classes.button}>
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </div>
        );
    }
}

export default withStyles(styles)(CoursePaneButtonRow);
