import React, { Fragment } from 'react';
import ColorPicker from '../App/ColorPicker';
import { IconButton } from '@material-ui/core';
import { deleteCourse, deleteCustomEvent } from '../../actions/AppStoreActions';
import AppStore from '../../stores/AppStore';
import { Delete } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const styles = {
    root: {
        padding: '4px 4px 0px 8px',
    },
    colorPicker: {
        cursor: 'pointer',
        '& > div': {
            margin: '0px 8px 0px 4px',
            height: '20px',
            width: '20px',
            borderRadius: '50%',
        },
    },
};

const ColorAndDelete = (props) => {
    const { sectionCode, color, classes } = props;
    return (
        <Fragment>
            <div className={classes.colorPicker}>
                <ColorPicker
                    color={color}
                    isCustomEvent={false}
                    sectionCode={sectionCode}
                />
            </div>
            <IconButton
                onClick={() =>
                    deleteCourse(
                        sectionCode,
                        AppStore.getCurrentScheduleIndex()
                    )
                }
            >
                <Delete fontSize="small" />
            </IconButton>
        </Fragment>
    );
};

export default withStyles(styles)(ColorAndDelete);
