import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return [
        { url: 'https://antalmanac.com', lastModified, changeFrequency: 'weekly', priority: 1.0 },
        { url: 'https://antalmanac.com/calendar', lastModified, changeFrequency: 'weekly', priority: 0.9 },
        { url: 'https://antalmanac.com/added', lastModified, changeFrequency: 'weekly', priority: 0.9 },
        { url: 'https://antalmanac.com/map', lastModified, changeFrequency: 'weekly', priority: 0.9 },
        { url: 'https://antalmanac.com/planner', lastModified, changeFrequency: 'weekly', priority: 0.9 },
        { url: 'https://antalmanac.com/planner/reviews', lastModified, changeFrequency: 'weekly', priority: 0.7 },
    ];
}
