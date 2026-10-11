'use client';
import { Card, Divider, Skeleton } from '@mui/material';
import { latestRoadmapVersion } from '@peterportal/types';
import { FC, useState } from 'react';

import './Year.scss';
import './Quarter.scss';
import './Course.scss';
import './PlannerSkeleton.scss';
import { readLocalRoadmap } from '../../../helpers/planner';

interface SkeletonYear {
    collapsed: boolean;
    courseCounts: number[];
}

const fallbackShape: SkeletonYear[] = [{ collapsed: false, courseCounts: [2, 2, 2] }];

function getRoadmapSkeletonShape(): SkeletonYear[] {
    try {
        const roadmap = readLocalRoadmap();
        if (!('planners' in roadmap) || !('version' in roadmap) || roadmap.version < latestRoadmapVersion) {
            return fallbackShape;
        }

        const { planners } = roadmap;
        const planParam = new URLSearchParams(window.location.search).get('plan');
        const queryIndex = planParam ? planners.findIndex((plan) => plan.id === Number(planParam)) : -1;
        const planIndex = queryIndex >= 0 ? queryIndex : (roadmap.currentPlanIndex ?? 0);
        const planner = planners[Math.min(Math.max(planIndex, 0), planners.length - 1)];

        return planner.content.map((year) => ({
            collapsed: year.collapsed,
            courseCounts: year.quarters.map((quarter) => quarter.courses.length),
        }));
    } catch {
        return fallbackShape;
    }
}

const PlannerSkeleton: FC = () => {
    const [shape] = useState(getRoadmapSkeletonShape);
    const maxQuarterCount = Math.max(...shape.map((year) => year.courseCounts.length));

    return (
        <section
            className="years planner-skeleton"
            data-max-quarter-count={maxQuarterCount}
            aria-busy="true"
            aria-label="Loading roadmap"
        >
            {shape.map((year, yearIndex) => (
                <Card key={yearIndex} className="year" variant="outlined">
                    <div className="year-header">
                        <div className="year-title">
                            <Skeleton width={160} />
                        </div>
                        <div className="year-stats">
                            <Skeleton width={120} />
                        </div>
                        <div className="action-row">
                            {[0, 1, 2].map((i) => (
                                <Skeleton key={i} variant="circular" width={24} height={24} style={{ margin: 4 }} />
                            ))}
                        </div>
                    </div>
                    {!year.collapsed && (
                        <>
                            <Divider />
                            <Card className="quarter-list" variant="outlined">
                                {year.courseCounts.map((courseCount, quarterIndex) => (
                                    <Card key={quarterIndex} className="quarter" variant="outlined">
                                        <div className="quarter-header">
                                            <div className="quarter-title">
                                                <Skeleton width={72} />
                                            </div>
                                            <div className="quarter-units">
                                                <Skeleton width={56} />
                                            </div>
                                        </div>
                                        <div className="quarter-course-list">
                                            {Array.from({ length: courseCount }, (_, courseIndex) => (
                                                <div key={courseIndex} className="course roadmap-course">
                                                    <div className="course-drag-handle">
                                                        <Skeleton variant="rounded" width={24} height={24} />
                                                    </div>
                                                    <div className="course-and-info">
                                                        <Skeleton width={96} />
                                                    </div>
                                                    <div className="title">
                                                        <Skeleton width="80%" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                            </Card>
                        </>
                    )}
                </Card>
            ))}
        </section>
    );
};

export default PlannerSkeleton;
