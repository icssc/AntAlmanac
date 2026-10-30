import generatedMajors from '$generated/majors.json';
import { useSessionStore } from '$stores/SessionStore';
import { useUserInfoStore } from '$stores/UserInfoStore';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { SchoolSchema } from '@packages/antalmanac-types';
import { MAJOR_SCHOOLS_MAP } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useState } from 'react';
import { type z } from 'zod';
import { useShallow } from 'zustand/react/shallow';

// Dropdown selectors imitating the department dropdown in manual search

// TODO get rid of school selector and make school get auto-inferred by whatever major the user selects
// This is needed because for example you can't have CS Major BS in the nursing school, which is possible right now

type School = z.infer<typeof SchoolSchema>;

const ALL_MAJORS: Record<string, string> = generatedMajors;

interface MajorFieldProps {
    value: string | null;
    onChange: (major: string | null) => void;
}

const MajorField = memo(({ value, onChange }: MajorFieldProps) => {
    const options = Object.keys(ALL_MAJORS);

    const handleChange = useCallback(
        (_: unknown, option: string | null) => {
            onChange(option);
        },
        [onChange]
    );

    return (
        <Autocomplete
            value={value && value in ALL_MAJORS ? value : null}
            options={options}
            autoHighlight
            openOnFocus
            getOptionLabel={(option) => ALL_MAJORS[option] ?? option}
            onChange={handleChange}
            includeInputInList
            noOptionsText="No majors match the search"
            renderInput={(params) => <TextField {...params} fullWidth size="small" placeholder="Select your major" />}
        />
    );
});

MajorField.displayName = 'MajorField';

interface SchoolFieldProps {
    value: School | null;
    onChange: (school: School | null) => void;
}

const SchoolField = memo(({ value, onChange }: SchoolFieldProps) => {
    const options = SchoolSchema.options;

    const handleChange = useCallback(
        (_: unknown, option: School | null) => {
            onChange(option);
        },
        [onChange]
    );

    return (
        <Autocomplete
            value={value}
            options={options}
            autoHighlight
            openOnFocus
            onChange={handleChange}
            includeInputInList
            noOptionsText="No schools match the search"
            renderInput={(params) => <TextField {...params} fullWidth size="small" placeholder="Select your school" />}
        />
    );
});

SchoolField.displayName = 'SchoolField';

export function MajorSelector() {
    const sessionIsValid = useSessionStore((state) => state.sessionIsValid);
    const [savedMajor, savedSchool, setMajorSchool] = useUserInfoStore(
        useShallow((state) => [state.major, state.school, state.setMajorSchool])
    );

    const [major, setMajor] = useState<string | null>(savedMajor);
    const [school, setSchool] = useState<School | null>(savedSchool);

    useEffect(() => {
        setMajor(savedMajor);
        setSchool(savedSchool);
    }, [savedMajor, savedSchool]);

    const handleMajorChange = useCallback(
        (newMajor: string | null) => {
            setMajor(newMajor);
            const newSchool = (newMajor && MAJOR_SCHOOLS_MAP[newMajor]) || school;
            if (newMajor && newSchool) {
                void setMajorSchool(newMajor, newSchool);
            }
        },
        [school, setMajorSchool]
    );

    const handleSchoolChange = useCallback(
        (nextSchool: School | null) => {
            setSchool(nextSchool);
            if (major && nextSchool) {
                void setMajorSchool(major, nextSchool);
            }
        },
        [major, setMajorSchool]
    );

    if (!sessionIsValid) {
        return null;
    }

    return (
        <>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Major
                </Typography>
                <MajorField value={major} onChange={handleMajorChange} />
            </Box>

            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    School
                </Typography>
                <SchoolField value={school} onChange={handleSchoolChange} />
            </Box>
        </>
    );
}
