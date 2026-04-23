import { useDepartments } from '$hooks/useDepartments';
import { useGradeExplorerStore, type GradeQuery } from '$stores/GradeExplorerStore';
import {
    Autocomplete,
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import type { Division, Quarter } from '@packages/anteater-api-types/src/grades';
import { useMemo } from 'react';

const QUARTERS: Quarter[] = ['Fall', 'Winter', 'Spring', 'Summer1', 'Summer10wk', 'Summer2'];
const DIVISIONS: Array<{ value: Division; label: string }> = [
    { value: 'ANY', label: 'All divisions' },
    { value: 'LowerDiv', label: 'Lower division' },
    { value: 'UpperDiv', label: 'Upper division' },
    { value: 'Graduate', label: 'Graduate' },
];

/** Generate a list of academic years from 2014 through the current year. */
function buildYearOptions(): string[] {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let y = currentYear; y >= 2014; y--) years.push(String(y));
    return years;
}

interface DepartmentOption {
    code: string;
    label: string;
}

export function QueryForm() {
    const activeQueryId = useGradeExplorerStore((s) => s.activeQueryId);
    const query = useGradeExplorerStore((s) => s.queries.find((q) => q.id === s.activeQueryId));
    const updateQuery = useGradeExplorerStore((s) => s.updateQuery);

    const { departments } = useDepartments();
    const departmentOptions = useMemo<DepartmentOption[]>(() => {
        if (!departments) return [];
        return Object.entries(departments)
            .filter(([code]) => code !== 'ALL')
            .map(([code, label]) => ({ code, label }));
    }, [departments]);

    const yearOptions = useMemo(() => buildYearOptions(), []);

    if (!query || activeQueryId === null) {
        return (
            <Typography variant="body2" color="text.secondary">
                Select a query to edit its filters.
            </Typography>
        );
    }

    const patch = (updates: Partial<Omit<GradeQuery, 'id'>>) => updateQuery(activeQueryId, updates);

    const selectedDept = departmentOptions.find((opt) => opt.code === query.department?.toUpperCase()) ?? null;

    return (
        <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <Box flex={1}>
                    <Autocomplete
                        size="small"
                        options={departmentOptions}
                        getOptionLabel={(opt) => opt.label}
                        value={selectedDept}
                        onChange={(_e, value) => patch({ department: value?.code ?? undefined })}
                        isOptionEqualToValue={(opt, val) => opt.code === val.code}
                        renderInput={(params) => <TextField {...params} label="Department" />}
                        loading={!departments}
                        clearOnBlur
                    />
                </Box>
                <TextField
                    size="small"
                    label="Course #"
                    value={query.courseNumber ?? ''}
                    onChange={(e) => patch({ courseNumber: e.target.value || undefined })}
                    sx={{ width: { xs: '100%', md: 140 } }}
                    placeholder="e.g. 161"
                />
                <TextField
                    size="small"
                    label="Instructor"
                    value={query.instructor ?? ''}
                    onChange={(e) => patch({ instructor: e.target.value || undefined })}
                    fullWidth
                    placeholder="Last name, case-insensitive"
                />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel id="grade-explorer-year">Year</InputLabel>
                    <Select
                        labelId="grade-explorer-year"
                        label="Year"
                        value={query.year ?? ''}
                        onChange={(e) => patch({ year: e.target.value || undefined })}
                    >
                        <MenuItem value="">
                            <em>All years</em>
                        </MenuItem>
                        {yearOptions.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="grade-explorer-quarter">Quarter</InputLabel>
                    <Select
                        labelId="grade-explorer-quarter"
                        label="Quarter"
                        value={query.quarter ?? ''}
                        onChange={(e) => patch({ quarter: (e.target.value || undefined) as Quarter | undefined })}
                    >
                        <MenuItem value="">
                            <em>All quarters</em>
                        </MenuItem>
                        {QUARTERS.map((q) => (
                            <MenuItem key={q} value={q}>
                                {q}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="grade-explorer-division">Division</InputLabel>
                    <Select
                        labelId="grade-explorer-division"
                        label="Division"
                        value={query.division ?? 'ANY'}
                        onChange={(e) => patch({ division: (e.target.value || undefined) as Division | undefined })}
                    >
                        {DIVISIONS.map((d) => (
                            <MenuItem key={d.value} value={d.value}>
                                {d.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    size="small"
                    label="Section code"
                    value={query.sectionCode ?? ''}
                    onChange={(e) => patch({ sectionCode: e.target.value || undefined })}
                    sx={{ width: { xs: '100%', md: 160 } }}
                    placeholder="5-digit code"
                />
            </Stack>
        </Stack>
    );
}
