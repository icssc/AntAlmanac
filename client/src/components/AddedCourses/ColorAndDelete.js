import React from 'react';
import ColorPicker from '../App/ColorPicker';
import { IconButton } from '@material-ui/core';
import { deleteCourse } from '../../actions/AppStoreActions';
import AppStore from '../../stores/AppStore';
import { Delete } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import ReactGA from 'react-ga';

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
    const { sectionCode, color, classes, term } = props;
    return (
        <td className={classes.td}>
            <div className={classes.container}>
                <ColorPicker color={color} isCustomEvent={false} sectionCode={sectionCode} term={term} />
                <IconButton
                    onClick={() => {
                        deleteCourse(sectionCode, AppStore.getCurrentScheduleIndex(), term);
                        ReactGA.event({
                            category: 'antalmanac-rewrite',
                            action: 'Click Delete Course',
                            label: 'Added Course pane',
                        });
                    }}
                >
                    <Delete fontSize="small" />
                </IconButton>
            </div>
        </td>
    );
};

export default withStyles(styles)(ColorAndDelete);
