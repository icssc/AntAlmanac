import { normalizeMajorName } from '$planner/helpers/courseRequirements';
import { filterOptionsWithAbbreviations, mapAbbreviations } from '$planner/helpers/selector';
import { useIsLoggedIn } from '$planner/hooks/isLoggedIn';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import {
    type MinorRequirements,
    addMinor,
    removeMinor,
    setMinorList,
} from '$planner/store/slices/courseRequirementsSlice';
import trpc from '$planner/trpc';
import { Autocomplete, type FilterOptionsState, TextField } from '@mui/material';
import { type MinorProgram } from '@packages/planner-types';
import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import MinorCourseList from './MinorCourseList';

function updateSelectedMinors(minorIds: string[]) {
    trpc.programs.saveSelectedMinor.mutate({ minorIds });
}

interface MinorOption {
    value: MinorProgram;
    label: string;
}

const MinorSelector: FC = () => {
    const isLoggedIn = useIsLoggedIn();
    const minors = useAppSelector((state) => state.courseRequirements.minorList);
    const selectedMinors = useAppSelector((state) => state.courseRequirements.selectedMinors);
    const hasFetchedSelectedMinors = useRef(false);

    const [minorsLoading, setMinorsLoading] = useState(false);

    const dispatch = useAppDispatch();

    // Initial Load Helpers
    const saveInitialMinorList = useCallback(
        (minors: MinorProgram[]) => {
            for (const m of minors) m.name = normalizeMajorName(m);
            minors.sort((a, b) => a.name.localeCompare(b.name));
            setMinorsLoading(false);
            dispatch(setMinorList(minors));
        },
        [dispatch]
    );

    // Initial Load, fetch minors
    useEffect(() => {
        if (minors.length) return;
        trpc.programs.getMinors.query().then(saveInitialMinorList);
    }, [dispatch, minors.length, saveInitialMinorList]);

    const saveMinors = useCallback(
        (minorsToSave: MinorRequirements[]) => {
            if (!isLoggedIn) return;
            const minorIds: string[] = minorsToSave.map((m) => m.minor.id);
            updateSelectedMinors(minorIds);
        },
        [isLoggedIn]
    );

    const handleMinorChange = useCallback(
        (_event: unknown, selections: MinorOption[] | null) => {
            const newMinors = selections?.map((s) => s.value) || [];
            const currentMinorIds = selectedMinors.map((m) => m.minor.id);

            currentMinorIds.forEach((id) => {
                if (!newMinors.find((m) => m.id === id)) dispatch(removeMinor(id));
            });
            newMinors.forEach((minor) => {
                if (!currentMinorIds.includes(minor.id)) dispatch(addMinor(minor));
            });

            const updatedMinors = newMinors.map((minor) => ({
                minor,
                requirements: selectedMinors.find((m) => m.minor.id === minor.id)?.requirements || [],
            }));
            saveMinors(updatedMinors);
        },
        [dispatch, saveMinors, selectedMinors]
    );

    useEffect(() => {
        if (!minors.length || !isLoggedIn) return;
        if (hasFetchedSelectedMinors.current) return;
        hasFetchedSelectedMinors.current = true;

        setMinorsLoading(true);

        trpc.programs.getSavedMinors
            .query()
            .then((minorIds) => {
                for (const minor of minorIds) {
                    const foundMinor = minors.find((m) => m.id === minor.id);
                    if (!foundMinor) continue;
                    dispatch(addMinor(foundMinor));
                }
            })
            .finally(() => {
                setMinorsLoading(false);
            });
    }, [dispatch, minors, isLoggedIn]);

    const minorSelectOptions: MinorOption[] = minors.map((m) => ({
        value: m,
        label: `${m.name}`,
    }));

    const minorAbbreviations = useMemo(() => mapAbbreviations(minors), [minors]);

    const filterMinorOptions = (options: MinorOption[], state: FilterOptionsState<MinorOption>) =>
        filterOptionsWithAbbreviations(options, state, minorAbbreviations);

    return (
        <>
            <Autocomplete
                multiple
                options={minorSelectOptions}
                value={selectedMinors
                    .map((m) => minorSelectOptions.find((o) => o.value.id === m.minor.id)!)
                    .filter(Boolean)}
                onChange={handleMinorChange}
                getOptionLabel={(option) => option.label}
                getOptionKey={(option) => option.value.id}
                isOptionEqualToValue={(option, value) => option.value.id === value.value.id}
                filterOptions={filterMinorOptions}
                loading={minorsLoading}
                disabled={minorsLoading}
                disableClearable
                className="minor-select"
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        placeholder={selectedMinors.length === 0 ? 'Select minors...' : undefined}
                    />
                )}
            />
            {selectedMinors.map((data) => (
                <MinorCourseList key={data.minor.id} minorReqs={data} />
            ))}
        </>
    );
};

export default MinorSelector;
