import './MajorCourseList.scss';
import { Autocomplete, Collapse, TextField } from '@mui/material';
import { MajorSpecialization } from '@peterportal/types';
import { FC, useCallback, useEffect, useState, useMemo } from 'react';

import ClickableDiv from '../../../component/ClickableDiv/ClickableDiv';
import { ExpandMore } from '../../../component/ExpandMore/ExpandMore';
import LoadingSpinner from '../../../component/LoadingSpinner/LoadingSpinner';
import { normalizeMajorName, getCatalogYearDefaults } from '../../../helpers/courseRequirements';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
    MajorWithSpecialization,
    setGroupExpanded,
    setMajorCatalogYear,
    setMajorFallbackCatalogYear,
    setMajorSpecs,
    setRequirements,
    setSpecialization,
} from '../../../store/slices/courseRequirementsSlice';
import trpc from '../../../trpc';
import CatalogYears, { CatalogYearWarning } from './CatalogYears';
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

function getMajorSpecializations(majorId: string, catalogYear: string) {
    return trpc.programs.getSpecializations.query({ major: majorId, catalogYear });
}

function getCoursesForMajor(programId: string, specId: string | undefined, catalogYear: string) {
    const specializationId = specId === noSpecId ? undefined : specId;
    return trpc.programs.getRequiredCourses.query({
        type: 'major',
        programId,
        specializationId,
        catalogYear: catalogYear,
    });
}

async function getCoursesForSpecialization(programId: string | undefined, catalogYear: string) {
    if (!programId || programId === noSpecId) return [];
    const result = await trpc.programs.getRequiredCourses.query({ type: 'specialization', programId, catalogYear });
    return result.requirements;
}

interface MajorCourseListProps {
    majorWithSpec: MajorWithSpecialization;
    onSpecializationChange: (majorId: string, spec: MajorSpecialization | null) => void;
    selectedSpecId?: string;
    onCatalogYearChange: (majorId: string, catalogYear: string | null) => void;
}

const MajorCourseList: FC<MajorCourseListProps> = ({
    majorWithSpec,
    onSpecializationChange,
    selectedSpecId,
    onCatalogYearChange,
}) => {
    const storeKeyPrefix = `major-${majorWithSpec.major.id}`;
    const [specsLoading, setSpecsLoading] = useState(false);
    const [resultsLoading, setResultsLoading] = useState(false);
    const open = useAppSelector((state) => state.courseRequirements.expandedGroups[storeKeyPrefix] ?? false);
    const setOpen = (isOpen: boolean) => {
        dispatch(setGroupExpanded({ storeKey: storeKeyPrefix, expanded: isOpen }));
    };

    const { major, selectedSpec, specializations } = majorWithSpec;
    const hasSpecs = major.specializationRequired || major.specializations.length > 0 || specializations.length > 0;
    const specOptions = specializations.map((s) => ({ value: s, label: s.name }));
    const noSpec = useMemo(() => ({ id: noSpecId, majorId: major.id, name: 'No Specialization' }), [major.id]);
    const fallbackCatalogYear = majorWithSpec.fallbackCatalogYear ?? null;

    if (specOptions.length > 0 && !major.specializationRequired) {
        specOptions.unshift({ value: noSpec, label: noSpec.name });
    }

    const dispatch = useAppDispatch();
    const { defaultCatalogYear } = getCatalogYearDefaults();

    const loadSpecs = useCallback(
        async (catalogYear = majorWithSpec.catalogYear ?? defaultCatalogYear) => {
            setSpecsLoading(true);
            try {
                const specs = await getMajorSpecializations(major.id, catalogYear);
                specs.forEach((s) => (s.name = normalizeMajorName(s)));
                specs.sort((a, b) => a.name.localeCompare(b.name));
                dispatch(setMajorSpecs({ majorId: major.id, specializations: specs }));
            } finally {
                setSpecsLoading(false);
            }
        },
        [defaultCatalogYear, dispatch, major.id, majorWithSpec.catalogYear]
    );

    const fetchRequirements = useCallback(
        async (majorId: string, specId?: string, catalogYear?: string) => {
            const effectiveCatalogYear = catalogYear ?? defaultCatalogYear;
            setResultsLoading(true);
            dispatch(setMajorFallbackCatalogYear({ majorId, fallbackCatalogYear: null })); // reset fallback year on each fetch

            try {
                const result = await getCoursesForMajor(majorId, specId, effectiveCatalogYear);
                const { requirements, catalogYear: returnedYear } = result;

                // If API resolved to a different year than requested, set fallback
                if (returnedYear && returnedYear !== effectiveCatalogYear) {
                    dispatch(setMajorFallbackCatalogYear({ majorId, fallbackCatalogYear: returnedYear }));
                }

                const specRequirements = await getCoursesForSpecialization(specId, effectiveCatalogYear);
                requirements.push(...specRequirements);
                dispatch(setRequirements({ majorId, requirements }));
            } finally {
                setResultsLoading(false);
            }
        },
        [dispatch, defaultCatalogYear]
    );

    const loadSpecRequirements = useCallback(async () => {
        if (!hasSpecs) {
            if (majorWithSpec.requirements.length > 0) return;
            else return await fetchRequirements(major.id, undefined, majorWithSpec.catalogYear ?? undefined);
        }
        if (!selectedSpecId && !selectedSpec?.id) return;
        if (selectedSpecId === selectedSpec?.id) return;

        const specs = await getMajorSpecializations(major.id, majorWithSpec.catalogYear ?? defaultCatalogYear);
        const foundSpec = specs.find((s) => s.id === selectedSpecId);

        if (foundSpec) {
            dispatch(setSpecialization({ majorId: major.id, specialization: foundSpec }));
            await fetchRequirements(major.id, foundSpec?.id, majorWithSpec.catalogYear ?? undefined);
        } else if (selectedSpecId === noSpecId) {
            dispatch(setSpecialization({ majorId: major.id, specialization: noSpec }));
            await fetchRequirements(major.id, undefined, majorWithSpec.catalogYear ?? undefined);
        }
    }, [
        dispatch,
        fetchRequirements,
        hasSpecs,
        noSpec,
        major.id,
        majorWithSpec.requirements.length,
        majorWithSpec.catalogYear,
        defaultCatalogYear,
        selectedSpecId,
        selectedSpec?.id,
    ]);

    // Initial Loader
    useEffect(() => {
        if (specOptions.length > 0) {
            if (selectedSpecId && selectedSpec?.id !== selectedSpecId) {
                loadSpecRequirements();
            }
            return;
        }
        loadSpecs().then(loadSpecRequirements);
    }, [loadSpecRequirements, loadSpecs, selectedSpecId, selectedSpec?.id, specOptions.length]);

    const handleSpecializationChange = useCallback(
        async (data: { value: MajorSpecialization; label: string } | null) => {
            const updatedSpec = data?.value ?? null;
            if (updatedSpec?.id === selectedSpecId) return;

            setResultsLoading(true);
            onSpecializationChange(major.id, updatedSpec);
            dispatch(setRequirements({ majorId: major.id, requirements: [] }));
            dispatch(setSpecialization({ majorId: major.id, specialization: updatedSpec }));
            await fetchRequirements(major.id, updatedSpec?.id, majorWithSpec.catalogYear ?? undefined);
        },
        [dispatch, fetchRequirements, major, majorWithSpec.catalogYear, onSpecializationChange, selectedSpecId]
    );

    const toggleExpand = () => setOpen(!open);
    const selectedSpecOption = specOptions.find(
        (s) => s.value.id === (majorWithSpec.selectedSpec?.id ?? selectedSpec?.id)
    );

    const handleCatalogYearChange = useCallback(
        async (newCatalogYear: string) => {
            if (newCatalogYear === majorWithSpec.catalogYear) return;

            setResultsLoading(true);
            onCatalogYearChange(major.id, newCatalogYear);
            dispatch(setRequirements({ majorId: major.id, requirements: [] }));
            dispatch(setMajorCatalogYear({ majorId: major.id, catalogYear: newCatalogYear }));
            await loadSpecs(newCatalogYear);
            await fetchRequirements(major.id, selectedSpec?.id, newCatalogYear ?? undefined);
        },
        [
            dispatch,
            fetchRequirements,
            loadSpecs,
            major.id,
            majorWithSpec.catalogYear,
            onCatalogYearChange,
            selectedSpec?.id,
        ]
    );
    return (
        <div className="major-section">
            <ClickableDiv className="header-tab" onClick={toggleExpand}>
                <h4 className="major-name">{major.name}</h4>
                <ExpandMore className="expand-requirements" expanded={open} onClick={toggleExpand} />
            </ClickableDiv>
            <Collapse in={open} unmountOnExit>
                <CatalogYears catalogYear={majorWithSpec.catalogYear} tab="major" onChange={handleCatalogYearChange} />
                {fallbackCatalogYear && !resultsLoading && (
                    <CatalogYearWarning fallback={fallbackCatalogYear} catalogYear={majorWithSpec.catalogYear} />
                )}
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
