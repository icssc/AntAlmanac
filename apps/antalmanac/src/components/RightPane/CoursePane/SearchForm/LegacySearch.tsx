import { Button, Theme } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';

import AdvancedSearch from './AdvancedSearch';
import CourseNumberSearchBar from './CourseNumberSearchBar';
import DeptSearchBar from './DeptSearchBar/DeptSearchBar';
import GESelector from './GESelector';
import SectionCodeSearchBar from './SectionCodeSearchBar';
import RestrictionsFilter from './RestrictionsFilter';

const styles: Styles<Theme, object> = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    collapse: {
        display: 'inline-flex',
        cursor: 'pointer',
        marginTop: 20,
        marginBotton: 10,
    },
    search: {
        display: 'flex',
        justifyContent: 'center',
        borderTop: 'solid 8px transparent',
    },
    margin: {
        borderTop: 'solid 8px transparent',
        display: 'inline-flex',
        width: '100%',
    },
    new: {
        width: '55%',
        position: 'absolute',
        bottom: 0,
        left: 0,
    },
    searchButton: {
        width: '50%',
    },
    buttonContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-evenly',
    },
};

function LegacySearch(props: { classes: ClassNameMap; onSubmit: () => void; onReset: () => void }) {
    const { classes, onSubmit, onReset } = props;
    return (
        <>
            <div className={classes.margin}>
                <DeptSearchBar />
                <CourseNumberSearchBar />
            </div>

            <div className={classes.margin}>
                <GESelector />
                <RestrictionsFilter />
                <SectionCodeSearchBar />
            </div>

            <AdvancedSearch />

            <div className={classes.search}>
                <div className={classes.buttonContainer}>
                    <Button
                        className={classes.searchButton}
                        color="primary"
                        variant="contained"
                        onClick={onSubmit}
                        type="submit"
                    >
                        Search
                    </Button>

                    <Button variant="contained" onClick={onReset}>
                        Reset
                    </Button>
                </div>
            </div>
        </>
    );
}

export default withStyles(styles)(LegacySearch);
