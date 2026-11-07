import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [{ url: 'https://antalmanac.com/planner', changeFrequency: 'weekly', priority: 1.0 }];
}
