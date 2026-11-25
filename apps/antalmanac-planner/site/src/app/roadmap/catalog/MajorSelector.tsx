import { Autocomplete, FilterOptionsState, TextField } from '@mui/material';
import { MajorProgram, MajorSpecialization, SavedMajorProgram } from '@peterportal/types';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { normalizeMajorName } from '../../../helpers/courseRequirements';
import { cachedProgramQuery } from '../../../helpers/programCache';
import { filterOptionsWithAbbreviations, mapAbbreviations } from '../../../helpers/selector';
import { readUserSnapshot, writeUserSnapshot } from '../../../helpers/userSnapshot';
import { useIsLoggedIn } from '../../../hooks/isLoggedIn';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
    addMajor,
    removeMajor,
    setMajorList,
    MajorWithSpecialization,
    setMajorCatalogYear,
} from '../../../store/slices/courseRequirementsSlice';
import trpc from '../../../trpc';
import MajorCourseList from './MajorCourseList';

const majorsSnapshotName = 'selected-majors';

interface MajorsSnapshot {
    majors: MajorProgram[];
    saved: SavedMajorProgram[];
}

function updateSelectedMajorAndSpecialization(majors: SavedMajorProgram[]) {
    trpc.programs.saveSelectedMajors.mutate({ majors });
}

interface MajorOption {
    value: MajorProgram;
    label: string;
}

const MajorSelector: FC = () => {
    const isLoggedIn = useIsLoggedIn();
    const majors = useAppSelector((state) => state.courseRequirements.majorList);
    const selectedMajors = useAppSelector((state) => state.courseRequirements.selectedMajors);
    const userKey = useAppSelector((state) => state.user.user?.email);
    const hasFetchedSelectedMajors = useRef(false);
    const hydratedFromSnapshot = useRef(false);
    const snapshotMajorIds = useRef(new Set<string>());
    const [savedMajors, setSavedMajors] = useState<SavedMajorProgram[]>([]);

    const [majorsLoading, setMajorsLoading] = useState(false);

    const dispatch = useAppDispatch();

    // Initial Load Helpers
    const saveInitialMajorList = useCallback(
        (majors: MajorProgram[]) => {
            for (const m of majors) m.name = normalizeMajorName(m);
            majors.sort((a, b) => a.name.localeCompare(b.name));
            setMajorsLoading(false);
            dispatch(setMajorList(majors));
        },
        [dispatch]
    );

    // Initial Load, fetch majors
    useEffect(() => {
        if (majors.length) return;
        cachedProgramQuery('majors', () => trpc.programs.getMajors.query()).then(saveInitialMajorList);
    }, [dispatch, majors.length, saveInitialMajorList]);

    const saveMajors = useCallback(
        (majorsToSave: MajorWithSpecialization[]) => {
            if (!isLoggedIn) return;
            const majors: SavedMajorProgram[] = majorsToSave.map((m) => ({
                majorId: m.major.id,
                specializationId: m.selectedSpec?.id,
                catalogYear: m.catalogYear ?? undefined,
            }));
            updateSelectedMajorAndSpecialization(majors);
            if (userKey) {
                writeUserSnapshot<MajorsSnapshot>(majorsSnapshotName, userKey, {
                    majors: majorsToSave.map((m) => m.major),
                    saved: majors,
                });
            }
        },
        [isLoggedIn, userKey]
    );

    const handleMajorChange = useCallback(
        (_event: unknown, selections: MajorOption[] | null) => {
            const newMajors = selections?.map((s) => s.value) || [];
            const currentMajorIds = selectedMajors.map((m) => m.major.id);

            currentMajorIds.forEach((id) => {
                if (!newMajors.find((m) => m.id === id)) dispatch(removeMajor(id));
            });
            newMajors.forEach((major) => {
                if (!currentMajorIds.includes(major.id)) dispatch(addMajor(major));
            });

            const updatedMajors = newMajors.map((major) => ({
                major,
                selectedSpec: selectedMajors.find((m) => m.major.id === major.id)?.selectedSpec || null,
                specializations: selectedMajors.find((m) => m.major.id === major.id)?.specializations || [],
                requirements: selectedMajors.find((m) => m.major.id === major.id)?.requirements || [],
                catalogYear: selectedMajors.find((m) => m.major.id === major.id)?.catalogYear || null,
                fallbackCatalogYear: selectedMajors.find((m) => m.major.id === major.id)?.fallbackCatalogYear || null,
            }));
            saveMajors(updatedMajors);
        },
        [dispatch, saveMajors, selectedMajors]
    );

    const handleSpecializationChange = useCallback(
        async (majorId: string, specialization: MajorSpecialization | null) => {
            const updatedMajors = selectedMajors.map((m) =>
                m.major.id === majorId ? { ...m, selectedSpec: specialization } : m
            );
            setSavedMajors(
                savedMajors.map((major) =>
                    major.majorId === majorId ? { ...major, specializationId: specialization?.id } : major
                )
            );
            saveMajors(updatedMajors);
        },
        [savedMajors, saveMajors, selectedMajors]
    );

    const handleCatalogYearChange = useCallback(
        (majorId: string, catalogYear: string | null) => {
            const updatedMajors = selectedMajors.map((m) => (m.major.id === majorId ? { ...m, catalogYear } : m));
            setSavedMajors(
                savedMajors.map((major) =>
                    major.majorId === majorId ? { ...major, catalogYear: catalogYear ?? undefined } : major
                )
            );
            saveMajors(updatedMajors);
        },
        [savedMajors, saveMajors, selectedMajors]
    );

    // Show the last-seen selection immediately (so its requirements can start loading without waiting for the major
    // list and the saved selection); the server's copy below replaces it
    useEffect(() => {
        if (!isLoggedIn || !userKey || hydratedFromSnapshot.current) return;
        hydratedFromSnapshot.current = true;
        const snapshot = readUserSnapshot<MajorsSnapshot>(majorsSnapshotName, userKey);
        if (!snapshot || !Array.isArray(snapshot.majors) || !Array.isArray(snapshot.saved)) return;
        for (const major of snapshot.majors) {
            dispatch(addMajor(major));
            const saved = snapshot.saved.find((s) => s.majorId === major.id);
            dispatch(setMajorCatalogYear({ majorId: major.id, catalogYear: saved?.catalogYear ?? null }));
            snapshotMajorIds.current.add(major.id);
        }
        setSavedMajors(snapshot.saved);
    }, [dispatch, isLoggedIn, userKey]);

    useEffect(() => {
        if (!majors.length || !isLoggedIn) return;
        if (hasFetchedSelectedMajors.current) return;
        hasFetchedSelectedMajors.current = true;

        setMajorsLoading(true);

        trpc.programs.getSavedMajors
            .query()
            .then((savedMajors) => {
                const serverMajors: MajorProgram[] = [];
                for (const savedMajor of savedMajors) {
                    const foundMajor = majors.find((m) => m.id === savedMajor.majorId);
                    if (!foundMajor) continue;
                    serverMajors.push(foundMajor);
                    dispatch(addMajor(foundMajor));
                    dispatch(
                        setMajorCatalogYear({
                            majorId: savedMajor.majorId,
                            catalogYear: savedMajor.catalogYear ?? null,
                        })
                    );
                }
                // Drop anything the last-seen copy showed that the server no longer has (e.g. changed on another device)
                for (const id of snapshotMajorIds.current) {
                    if (!serverMajors.some((m) => m.id === id)) dispatch(removeMajor(id));
                }
                snapshotMajorIds.current.clear();
                setSavedMajors(savedMajors);
                if (userKey)
                    writeUserSnapshot<MajorsSnapshot>(majorsSnapshotName, userKey, {
                        majors: serverMajors,
                        saved: savedMajors,
                    });
            })
            .finally(() => {
                setMajorsLoading(false);
            });
    }, [dispatch, majors, isLoggedIn, userKey]);

    const majorSelectOptions: MajorOption[] = majors.map((m) => ({
        value: m,
        label: `${m.name}, ${m.type}`,
    }));

    const majorAbbreviations = useMemo(() => mapAbbreviations(majors), [majors]);

    const filterMajorOptions = (options: MajorOption[], state: FilterOptionsState<MajorOption>) =>
        filterOptionsWithAbbreviations(options, state, majorAbbreviations);

    return (
        <>
            <Autocomplete
                multiple
                options={majorSelectOptions}
                value={selectedMajors
                    .map((m) => majorSelectOptions.find((o) => o.value.id === m.major.id)!)
                    .filter(Boolean)}
                onChange={handleMajorChange}
                getOptionLabel={(option) => option.label}
                getOptionKey={(option) => option.value.id}
                isOptionEqualToValue={(option, value) => option.value.id === value.value.id}
                filterOptions={filterMajorOptions}
                loading={majorsLoading}
                disabled={majorsLoading}
                disableClearable
                className="major-select"
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        placeholder={selectedMajors.length === 0 ? 'Select majors...' : undefined}
                    />
                )}
            />
            {selectedMajors.map((data) => (
                <MajorCourseList
                    key={data.major.id}
                    majorWithSpec={data}
                    selectedSpecId={savedMajors.find((major) => major.majorId === data.major.id)?.specializationId}
                    onSpecializationChange={handleSpecializationChange}
                    onCatalogYearChange={handleCatalogYearChange}
                />
            ))}
        </>
    );
};

export default MajorSelector;
