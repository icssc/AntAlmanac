import schedulerManifest from '@antalmanac-scheduler/src/app/manifest';
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    const scheduler = schedulerManifest();

    return {
        ...scheduler,
        shortcuts: [
            {
                name: 'Scheduler',
                short_name: 'Scheduler',
                description: 'Explore courses and build your class schedule.',
                url: '/',
            },
            {
                name: 'Planner',
                short_name: 'Planner',
                description: 'Plan your 4-year course roadmap at UCI.',
                url: '/planner',
            },
        ],
        description: 'A course exploration, scheduling, and 4-year planning tool for UCI anteaters.',
    };
}
