import './MajorCourseList.scss';
import ClickableDiv from '$planner/component/ClickableDiv/ClickableDiv';
import { ExpandMore } from '$planner/component/ExpandMore/ExpandMore';
import LoadingSpinner from '$planner/component/LoadingSpinner/LoadingSpinner';
import { normalizeMajorName } from '$planner/helpers/courseRequirements';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import {
    type MajorWithSpecialization,
    setGroupExpanded,
    setMajorSpecs,
    setRequirements,
    setSpecialization,
} from '$planner/store/slices/courseRequirementsSlice';
import trpc from '$planner/trpc';
import { Autocomplete, Collapse, TextField } from '@mui/material';
import { type MajorSpecialization } from '@packages/planner-types';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import ProgramRequirementsList from './ProgramRequirementsList';

const noSpecId = 'NO_SPEC';

const loadingSpecValue = {
    value: {
        id: 'loading_spec',
        majorId: '',
        name: '',
    },
    label: 'Loading...',
};

function getMajorSpecializations(majorId: string) {
    return trpc.programs.getSpecializations.query({ major: majorId });
}

function getCoursesForMajor(programId: string, specId: string | undefined) {
    const specializationId = specId === noSpecId ? undefined : specId;
    return trpc.programs.getRequiredCourses.query({ type: 'major', programId, specializationId });
}

function getCoursesForSpecialization(programId?: string | null) {
    if (!programId || programId === noSpecId) return [];
    return trpc.programs.getRequiredCourses.query({ type: 'specialization', programId });
}

interface MajorCourseListProps {
    majorWithSpec: MajorWithSpecialization;
    onSpecializationChange: (majorId: string, spec: MajorSpecialization | null) => void;
    selectedSpecId?: string;
}

const MajorCourseList: FC<MajorCourseListProps> = ({ majorWithSpec, onSpecializationChange, selectedSpecId }) => {
    const storeKeyPrefix = `major-${majorWithSpec.major.id}`;
    const [specsLoading, setSpecsLoading] = useState(false);
    const [resultsLoading, setResultsLoading] = useState(false);
    const open = useAppSelector((state) => state.courseRequirements.expandedGroups[storeKeyPrefix] ?? false);
    const setOpen = (isOpen: boolean) => {
        dispatch(setGroupExpanded({ storeKey: storeKeyPrefix, expanded: isOpen }));
    };

    const { major, selectedSpec, specializations } = majorWithSpec;
    const hasSpecs = major.specializations.length > 0;
    const specOptions = specializations.map((s) => ({ value: s, label: s.name }));
    const noSpec = useMemo(() => ({ id: noSpecId, majorId: major.id, name: 'No Specialization' }), [major.id]);

    if (specOptions.length > 0 && !major.specializationRequired) {
        specOptions.unshift({ value: noSpec, label: noSpec.name });
    }

    const dispatch = useAppDispatch();

    const loadSpecs = useCallback(async () => {
        setSpecsLoading(true);
        try {
            const specs = await getMajorSpecializations(major.id);
            specs.forEach((s) => (s.name = normalizeMajorName(s)));
            specs.sort((a, b) => a.name.localeCompare(b.name));
            dispatch(setMajorSpecs({ majorId: major.id, specializations: specs }));
        } finally {
            setSpecsLoading(false);
        }
    }, [dispatch, major.id]);

    const fetchRequirements = useCallback(
        async (majorId: string, specId?: string) => {
            setResultsLoading(true);

            try {
                const requirements = await getCoursesForMajor(majorId, specId);
                requirements.push(...(await getCoursesForSpecialization(specId)));
                dispatch(setRequirements({ majorId, requirements }));
            } finally {
                setResultsLoading(false);
            }
        },
        [dispatch]
    );

    const loadSpecRequirements = useCallback(async () => {
        if (!hasSpecs) {
            if (majorWithSpec.requirements.length > 0) return;
            else return await fetchRequirements(major.id);
        }
        if (!selectedSpecId && !selectedSpec?.id) return;
        if (selectedSpecId === selectedSpec?.id) return;

        const specs = await getMajorSpecializations(major.id);
        const foundSpec = specs.find((s) => s.id === selectedSpecId);

        if (foundSpec) {
            dispatch(setSpecialization({ majorId: major.id, specialization: foundSpec }));
            await fetchRequirements(major.id, foundSpec?.id);
        } else if (selectedSpecId === noSpecId) {
            dispatch(setSpecialization({ majorId: major.id, specialization: noSpec }));
            await fetchRequirements(major.id);
        }
    }, [
        dispatch,
        fetchRequirements,
        hasSpecs,
        noSpec,
        major.id,
        majorWithSpec.requirements.length,
        selectedSpecId,
        selectedSpec?.id,
    ]);

    // Initial Loader
    useEffect(() => {
        if (specOptions.length) return;
        if (hasSpecs && !specOptions.length) {
            loadSpecs().then(loadSpecRequirements);
        } else {
            loadSpecRequirements();
        }
    }, [hasSpecs, loadSpecRequirements, specOptions.length, loadSpecs]);

    const handleSpecializationChange = useCallback(
        async (data: { value: MajorSpecialization; label: string } | null) => {
            const updatedSpec = data?.value ?? null;
            if (updatedSpec?.id === selectedSpecId) return;

            setResultsLoading(true);
            onSpecializationChange(major.id, updatedSpec);
            dispatch(setRequirements({ majorId: major.id, requirements: [] }));
            dispatch(setSpecialization({ majorId: major.id, specialization: updatedSpec }));
            await fetchRequirements(major.id, updatedSpec?.id);
        },
        [dispatch, fetchRequirements, major, onSpecializationChange, selectedSpecId]
    );

    const toggleExpand = () => setOpen(!open);
    const selectedSpecOption = specOptions.find(
        (s) => s.value.id === (majorWithSpec.selectedSpec?.id ?? selectedSpec?.id)
    );

    return (
        <div className="major-section">
            <ClickableDiv className="header-tab" onClick={toggleExpand}>
                <h4 className="major-name">{major.name}</h4>
                <ExpandMore className="expand-requirements" expanded={open} onClick={toggleExpand} />
            </ClickableDiv>
            <Collapse in={open} unmountOnExit>
                {hasSpecs && (
                    <Autocomplete
                        className="specialization-select"
                        disableClearable
                        options={specOptions}
                        value={selectedSpecOption ?? loadingSpecValue}
                        inputValue={selectedSpecOption?.label ?? ''}
                        filterOptions={(options) => options}
                        onChange={(_event, option) => handleSpecializationChange(option)}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) => option.value.id === value.value.id}
                        disabled={specsLoading}
                        loading={specsLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                size="small"
                                placeholder="Select a specialization..."
                            />
                        )}
                    />
                )}
                {hasSpecs && !majorWithSpec.selectedSpec ? (
                    <p className="unselected-spec-notice">Please select a specialization to view requirements</p>
                ) : resultsLoading ? (
                    <LoadingSpinner />
                ) : (
                    <ProgramRequirementsList
                        requirements={majorWithSpec.requirements}
                        storeKeyPrefix={storeKeyPrefix}
                    />
                )}
            </Collapse>
        </div>
    );
};

export default MajorCourseList;
