'use client';
import { addPlannerYear } from '$planner/helpers/roadmapEdits';

import './AddYearPopup.scss';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import {
    reviseRoadmap,
    selectCurrentPlan,
    setShowToast,
    setToastMsg,
    setToastSeverity,
} from '$planner/store/slices/roadmapSlice';
import { type PlannerYearData } from '$planner/types/types';
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { type FC, useState } from 'react';

import YearModal from './YearModal';

interface AddYearProps {
    buttonSize: 'small' | 'xsmall';
}

const AddYearPopup: FC<AddYearProps> = ({ buttonSize }) => {
    const [showModal, setShowModal] = useState(false);
    const currentPlan = useAppSelector(selectCurrentPlan);
    const plannerYears = currentPlan.content.yearPlans;
    const dispatch = useAppDispatch();

    const placeholderName = 'Year ' + (plannerYears.length + 1);
    const placeholderYear =
        plannerYears.length === 0 ? new Date().getFullYear() : plannerYears[plannerYears.length - 1].startYear + 1;

    const saveHandler = (yearData: PlannerYearData) => {
        const { startYear, name, quarters } = yearData;
        const startYearConflict = plannerYears.find((year) => year.startYear === startYear);
        if (startYearConflict) {
            dispatch(setToastMsg(`Start year ${startYear} is already used by ${startYearConflict.name}!`));
            dispatch(setToastSeverity('error'));
            dispatch(setShowToast(true));
            return;
        }

        const nameConflict = plannerYears.find((year) => year.name === name);
        if (nameConflict) {
            const conflictYear = nameConflict.startYear;
            dispatch(setToastMsg(`The name "${name}" is already used for ${conflictYear}-${conflictYear + 1}!`));
            dispatch(setToastSeverity('error'));
            dispatch(setShowToast(true));
            return;
        }
        const collapsed = false;
        const revision = addPlannerYear(currentPlan.id, startYear, name, collapsed, quarters);
        dispatch(reviseRoadmap(revision));
        setShowModal(false);
    };

    return (
        <>
            <YearModal
                show={showModal}
                setShow={setShowModal}
                placeholderName={placeholderName}
                placeholderYear={placeholderYear}
                type="add"
                saveHandler={saveHandler}
                currentQuarters={['Fall', 'Winter', 'Spring']}
                // When the year changes, this will force default values to reset
                key={'add-year-' + placeholderYear}
            />
            <Button
                variant="contained"
                color="inherit"
                size={buttonSize}
                className="header-btn"
                onClick={() => setShowModal(true)}
                startIcon={<AddIcon />}
            >
                <span>Add Year</span>
            </Button>
        </>
    );
};

export default AddYearPopup;
