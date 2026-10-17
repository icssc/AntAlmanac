'use client';
import { Component, FC, ReactNode, useState } from 'react';

import { LOADING_COURSE_PLACEHOLDER } from '../../../helpers/courseRequirements';
import { defaultYear, getLocalSkeletonBlueprint, quarterDisplayNames } from '../../../helpers/planner';
import { PlannerQuarterCourse, PlannerQuarterData, PlannerYearData } from '../../../types/types';
import Year from './Year';

/**
 * Renders nothing if the wrapped tree throws. The skeleton renders real Years
 * from cached roadmap data, and shape drift in that cache shouldn't break the page.
 */
class SkeletonErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    override state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    override render() {
        return this.state.hasError ? null : this.props.children;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isValidCachedCourse(value: unknown): value is PlannerQuarterCourse {
    if (!isRecord(value)) return false;

    if ('courseName' in value) {
        return (
            typeof value.id === 'number' &&
            typeof value.courseName === 'string' &&
            typeof value.units === 'number' &&
            typeof value.description === 'string'
        );
    }

    return (
        typeof value.id === 'string' &&
        typeof value.department === 'string' &&
        typeof value.courseNumber === 'string' &&
        typeof value.title === 'string' &&
        typeof value.minUnits === 'number' &&
        typeof value.maxUnits === 'number' &&
        Array.isArray(value.terms) &&
        Array.isArray(value.geList)
    );
}

function isValidCachedQuarter(value: unknown): value is PlannerQuarterData {
    return (
        isRecord(value) &&
        typeof value.name === 'string' &&
        value.name in quarterDisplayNames &&
        Array.isArray(value.courses) &&
        value.courses.every(isValidCachedCourse)
    );
}

function isValidCachedYear(value: unknown): value is PlannerYearData {
    return (
        isRecord(value) &&
        typeof value.startYear === 'number' &&
        typeof value.name === 'string' &&
        typeof value.collapsed === 'boolean' &&
        Array.isArray(value.quarters) &&
        value.quarters.every(isValidCachedQuarter)
    );
}

function fallbackBlueprint(): PlannerYearData[] {
    const year = defaultYear() as PlannerYearData;
    const courses = [LOADING_COURSE_PLACEHOLDER, LOADING_COURSE_PLACEHOLDER];
    return [{ ...year, quarters: year.quarters.map(({ name }) => ({ name, courses })) }];
}

function readCachedBlueprint(): PlannerYearData[] {
    try {
        const parsed: unknown = JSON.parse(getLocalSkeletonBlueprint() ?? 'null');
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isValidCachedYear)) return parsed;
    } catch {
        /* ignore */
    }
    return fallbackBlueprint();
}

/**
 * Renders the previous roadmap's real Years with `skeleton`, so every
 * placeholder sizes to the element that replaces it once loading finishes.
 */
const RoadmapLoadingSkeleton: FC = () => {
    const [yearPlans] = useState(readCachedBlueprint);
    const maxQuarterCount = Math.max(...yearPlans.map((year) => year.quarters.length));

    return (
        <SkeletonErrorBoundary>
            <section
                className="years"
                data-max-quarter-count={maxQuarterCount}
                aria-busy="true"
                aria-label="Loading roadmap"
            >
                {yearPlans.map((year, yearIndex) => (
                    <Year key={yearIndex} yearIndex={yearIndex} data={year} skeleton />
                ))}
            </section>
        </SkeletonErrorBoundary>
    );
};

export default RoadmapLoadingSkeleton;
