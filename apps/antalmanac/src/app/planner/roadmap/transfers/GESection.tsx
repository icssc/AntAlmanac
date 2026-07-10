import './GESection.scss';
import LoadingSpinner from '$planner/component/LoadingSpinner/LoadingSpinner';
import { GE_TITLE_MAP } from '$planner/helpers/courseRequirements';
import { useIsLoggedIn } from '$planner/hooks/isLoggedIn';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import { setTransferredGE } from '$planner/store/slices/transferCreditsSlice';
import trpc from '$planner/trpc';
import { TextField } from '@mui/material';
import { ALL_GE_NAMES, type GEName, type TransferredGE } from '@packages/planner-types';
import React, { type FC } from 'react';

import MenuSection, { SectionDescription } from './MenuSection';
import MenuTile from './MenuTile';

interface GEInputProps {
    value: number;
    handleUpdate: (newValue: number) => void;
    valueType: 'numberOfCourses' | 'units';
}

const GEInput: FC<GEInputProps> = ({ value, handleUpdate, valueType }) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
    };

    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value === value.toString()) return;
        const invalidDecimal = valueType === 'numberOfCourses' && !Number.isInteger(e.target.valueAsNumber);
        if (isNaN(e.target.valueAsNumber) || e.target.valueAsNumber < 0 || invalidDecimal) {
            // Revert change for invalid values
            e.target.value = value.toString();
            return;
        }
        // auto-formats, i.e. removes leading zeros
        e.target.value = e.target.valueAsNumber.toString();
        if (e.target.valueAsNumber === value) return;
        handleUpdate(e.target.valueAsNumber);
    };

    return (
        <TextField
            className="ge-input"
            type="number"
            defaultValue={value}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
            slotProps={{
                htmlInput: {
                    min: 0,
                    step: valueType === 'numberOfCourses' ? '1' : 'any',
                    inputMode: valueType === 'numberOfCourses' ? 'numeric' : 'decimal',
                },
            }}
        />
    );
};

interface GEMenuTileProps {
    geName: GEName;
}

const GEMenuTile: FC<GEMenuTileProps> = ({ geName }) => {
    const dispatch = useAppDispatch();
    const isLoggedIn = useIsLoggedIn();

    const currentGE = useAppSelector((state) =>
        state.transferCredits.transferredGEs.find((ge) => ge.geName === geName)
    ) || { geName, numberOfCourses: 0, units: 0 };

    const updateGE = (newCourseCount: number, newUnitCount: number) => {
        const updatedGE: TransferredGE = {
            geName: currentGE.geName,
            numberOfCourses: newCourseCount,
            units: newUnitCount,
        };
        dispatch(setTransferredGE(updatedGE));
        if (!isLoggedIn) return;
        trpc.transferCredits.setTransferredGE.mutate(updatedGE);
    };

    const updateNumberOfCourses = (newValue: number) => {
        updateGE(newValue, currentGE.units);
    };

    const updateUnits = (newValue: number) => {
        updateGE(currentGE.numberOfCourses, newValue);
    };

    return (
        <MenuTile title={GE_TITLE_MAP[geName]}>
            <div className="ge-inputs">
                <div className="ge-input-container">
                    <p>Number of Courses:</p>
                    <GEInput
                        value={currentGE.numberOfCourses}
                        handleUpdate={updateNumberOfCourses}
                        valueType="numberOfCourses"
                    />
                </div>
                <div className="ge-input-container">
                    <p>Units Taken:</p>
                    <GEInput value={currentGE.units} handleUpdate={updateUnits} valueType="units" />
                </div>
            </div>
        </MenuTile>
    );
};

const GESection: FC = () => {
    const loading = useAppSelector((state) => state.transferCredits.dataLoadState !== 'done');

    return (
        <MenuSection title="General Education Credits">
            <SectionDescription>
                Enter the GE credits that you've received in each category from other colleges/universities.
            </SectionDescription>
            {loading ? <LoadingSpinner /> : ALL_GE_NAMES.map((geName) => <GEMenuTile key={geName} geName={geName} />)}
        </MenuSection>
    );
};

export default GESection;
