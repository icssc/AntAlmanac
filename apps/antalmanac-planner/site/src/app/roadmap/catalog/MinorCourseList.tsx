import './MajorCourseList.scss';
import { Collapse } from '@mui/material';
import { FC, useCallback, useEffect, useState } from 'react';

import ClickableDiv from '../../../component/ClickableDiv/ClickableDiv';
import { ExpandMore } from '../../../component/ExpandMore/ExpandMore';
import LoadingSpinner from '../../../component/LoadingSpinner/LoadingSpinner';
import { getCatalogYearDefaults } from '../../../helpers/courseRequirements';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
    setMinorRequirements,
    MinorRequirements,
    setGroupExpanded,
    setMinorCatalogYear,
    setMinorFallbackCatalogYear,
} from '../../../store/slices/courseRequirementsSlice';
import trpc from '../../../trpc';
import CatalogYears, { CatalogYearWarning } from './CatalogYears';
import ProgramRequirementsList from './ProgramRequirementsList';

function getCoursesForMinor(programId: string, catalogYear?: string) {
    return trpc.programs.getRequiredCourses.query({ type: 'minor', programId, catalogYear });
}

interface MinorCourseListProps {
    minorReqs: MinorRequirements;
    onCatalogYearChange: (minorId: string, catalogYear: string | null) => void;
}

const MinorCourseList: FC<MinorCourseListProps> = ({ minorReqs, onCatalogYearChange }) => {
    const storeKeyPrefix = `minor-${minorReqs.minor.id}`;
    const [resultsLoading, setResultsLoading] = useState(false);
    const fallbackCatalogYear = minorReqs.fallbackCatalogYear ?? null;
    const open = useAppSelector((state) => state.courseRequirements.expandedGroups[storeKeyPrefix] ?? false);
    const setOpen = (isOpen: boolean) => {
        dispatch(setGroupExpanded({ storeKey: storeKeyPrefix, expanded: isOpen }));
    };

    const dispatch = useAppDispatch();

    const { defaultCatalogYear } = getCatalogYearDefaults();

    const fetchRequirements = useCallback(
        async (minorId: string, catalogYear?: string) => {
            const effectiveCatalogYear = catalogYear ?? defaultCatalogYear;
            setResultsLoading(true);
            dispatch(setMinorFallbackCatalogYear({ minorId, fallbackCatalogYear: null }));

            try {
                const result = await getCoursesForMinor(minorId, effectiveCatalogYear);
                const { requirements, catalogYear: returnedYear } = result;

                if (returnedYear && returnedYear !== effectiveCatalogYear) {
                    dispatch(setMinorFallbackCatalogYear({ minorId, fallbackCatalogYear: returnedYear }));
                }

                dispatch(setMinorRequirements({ minorId, requirements }));
            } finally {
                setResultsLoading(false);
            }
        },
        [dispatch, defaultCatalogYear]
    );

    useEffect(() => {
        if (!minorReqs.requirements || minorReqs.requirements.length === 0) {
            fetchRequirements(minorReqs.minor.id, minorReqs.catalogYear ?? undefined);
        }
    }, [fetchRequirements, minorReqs.minor.id, minorReqs.requirements, minorReqs.catalogYear]);

    const toggleExpand = () => setOpen(!open);

    const handleCatalogYearChange = useCallback(
        async (newCatalogYear: string) => {
            if (newCatalogYear === minorReqs.catalogYear) return;

            setResultsLoading(true);
            onCatalogYearChange(minorReqs.minor.id, newCatalogYear);
            dispatch(setMinorRequirements({ minorId: minorReqs.minor.id, requirements: [] }));
            dispatch(setMinorCatalogYear({ minorId: minorReqs.minor.id, catalogYear: newCatalogYear }));
            await fetchRequirements(minorReqs.minor.id, newCatalogYear ?? undefined);
        },
        [dispatch, fetchRequirements, minorReqs.minor.id, minorReqs.catalogYear, onCatalogYearChange]
    );

    return (
        <div className="major-section">
            <ClickableDiv className="header-tab" onClick={toggleExpand}>
                <h4 className="major-name">{minorReqs.minor.name}</h4>
                <ExpandMore className="expand-requirements" expanded={open} onClick={toggleExpand} />
            </ClickableDiv>
            <Collapse in={open} unmountOnExit>
                <CatalogYears catalogYear={minorReqs.catalogYear} tab="minor" onChange={handleCatalogYearChange} />
                {fallbackCatalogYear && !resultsLoading && (
                    <CatalogYearWarning fallback={fallbackCatalogYear} catalogYear={minorReqs.catalogYear} />
                )}
                {resultsLoading ? (
                    <LoadingSpinner />
                ) : (
                    <ProgramRequirementsList requirements={minorReqs.requirements} storeKeyPrefix={storeKeyPrefix} />
                )}
            </Collapse>
        </div>
    );
};

export default MinorCourseList;
