import plannerSitemap from '@antalmanac-planner/site/src/app/sitemap';
import schedulerSitemap from '@antalmanac-scheduler/src/app/sitemap';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [...schedulerSitemap(), ...plannerSitemap()];
}
