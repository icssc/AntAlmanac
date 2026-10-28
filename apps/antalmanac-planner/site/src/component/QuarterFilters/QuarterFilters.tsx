import './QuarterFilters.scss';
import { Button } from '@mui/material';

import { quarterOptions, getStartYear } from '../../helpers/QuarterFilters.ts';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setQuarter, selectQuarters } from '../../store/slices/searchSlice.ts';

const QuarterFilters = () => {
    const selectedQuarters = useAppSelector(selectQuarters);
    const startYear = getStartYear();
    const dispatch = useAppDispatch();

    const updateSelectedQuarters = (toggledQuarter: string) => {
        dispatch(setQuarter(toggledQuarter));
    };

    return (
        <div className="filter-group">
            {Object.entries(quarterOptions).map(([quarterName, quarterIcon]) => (
                <Button
                    key={quarterName}
                    size="xsmall"
                    className={`quarter-filter-button ${selectedQuarters.includes(quarterName) ? 'selected' : ''}`}
                    variant="outlined"
                    onClick={() => updateSelectedQuarters(quarterName)}
                >
                    {quarterName} {quarterIcon}
                </Button>
            ))}
            <small>
                According to {startYear}-{startYear + 1} course offerings.
            </small>
        </div>
    );
};

export default QuarterFilters;
