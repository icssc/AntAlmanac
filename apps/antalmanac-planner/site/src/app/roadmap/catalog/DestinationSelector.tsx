import { MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material';
import { FC } from 'react';

import { quarterDisplayNames } from '../../../helpers/planner';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectCurrentPlan, setCurrentYearAndQuarter } from '../../../store/slices/roadmapSlice';

const selectSx = { backgroundColor: 'var(--mui-palette-background-paper)' };

const getYearOffset = (quarterName: keyof typeof quarterDisplayNames) =>
    Number(quarterDisplayNames[quarterName] !== quarterDisplayNames.Fall);

const DestinationSelector: FC = () => {
    const dispatch = useAppDispatch();
    const yearPlans = useAppSelector(selectCurrentPlan).content.yearPlans;
    const destination = useAppSelector((state) => state.roadmap.currentYearAndQuarter);
    const yearPlan = destination && yearPlans[destination.year];

    if (!destination || !yearPlan) return null;

    const quarterNames = yearPlans[0].quarters.map((quarter) => quarter.name);
    const selectedQuarterName = yearPlan.quarters[destination.quarter].name;
    const selectedYear = yearPlan.startYear + getYearOffset(selectedQuarterName);
    const years = Array.from({ length: yearPlans.length + 1 }, (_, index) => yearPlans[0].startYear + index);

    const findDestination = (year: number, quarterName: typeof selectedQuarterName) => {
        const yearIndex = yearPlans.findIndex((plan) => plan.startYear === year - getYearOffset(quarterName));
        if (yearIndex < 0) return null;
        const quarterIndex = yearPlans[yearIndex].quarters.findIndex((quarter) => quarter.name === quarterName);
        return quarterIndex < 0 ? null : { year: yearIndex, quarter: quarterIndex };
    };

    const handleYearChange = (event: SelectChangeEvent<number>) => {
        const year = Number(event.target.value);
        const sameQuarter = findDestination(year, selectedQuarterName);
        const firstQuarter = quarterNames.map((name) => findDestination(year, name)).find((found) => found);
        const nextDestination = sameQuarter ?? firstQuarter;
        if (nextDestination) dispatch(setCurrentYearAndQuarter(nextDestination));
    };

    const handleQuarterChange = (event: SelectChangeEvent) => {
        const nextDestination = findDestination(selectedYear, event.target.value as typeof selectedQuarterName);
        if (nextDestination) dispatch(setCurrentYearAndQuarter(nextDestination));
    };

    return (
        <Stack direction="row" spacing={1}>
            <Select size="small" sx={selectSx} value={selectedQuarterName} onChange={handleQuarterChange}>
                {quarterNames.map((name) => (
                    <MenuItem key={name} value={name} disabled={!findDestination(selectedYear, name)}>
                        {quarterDisplayNames[name]}
                    </MenuItem>
                ))}
            </Select>
            <Select size="small" sx={selectSx} value={selectedYear} onChange={handleYearChange}>
                {years.map((year) => (
                    <MenuItem key={year} value={year}>
                        {year}
                    </MenuItem>
                ))}
            </Select>
        </Stack>
    );
};

export default DestinationSelector;
