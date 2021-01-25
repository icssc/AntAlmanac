import React from 'react';
import ColorPicker from '../App/ColorPicker';
import { IconButton } from '@material-ui/core';
import { deleteCourse } from '../../actions/AppStoreActions';
import AppStore from '../../stores/AppStore';
import { Delete } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const styles = {
    td: {
        width: '100px',
    },
    container: {
        display: 'flex',
        justifyContent: 'space-evenly',
    },
};

const ColorAndDelete = (props) => {
    const { sectionCode, color, classes } = props;
    return (
        <td className={classes.td}>
            <div className={classes.container}>
                <ColorPicker color={color} isCustomEvent={false} sectionCode={sectionCode} />
                <IconButton onClick={() => deleteCourse(sectionCode, AppStore.getCurrentScheduleIndex())}>
                    <Delete fontSize="small" />
                </IconButton>
            </div>
        </td>
    );
};

export default withStyles(styles)(ColorAndDelete);
