import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: 'https://antalmanac.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
        { url: 'https://antalmanac.com/added', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: 'https://antalmanac.com/map', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ];
}
