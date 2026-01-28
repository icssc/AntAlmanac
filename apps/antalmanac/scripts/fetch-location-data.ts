/**
 * Pre-generates building location data from the UCI map API.
 * This script runs at preStart/prebuild to generate location data
 * that is consumed by the frontend.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OUTPUT_DIR = join(__dirname, '../src/generated/');
const BUILDING_CATALOGUE_FILE = join(OUTPUT_DIR, 'buildingCatalogue.ts');
const LOCATIONS_FILE = join(OUTPUT_DIR, 'locations.ts');

interface LocationListData {
    catId: number;
    lat: number;
    lng: number;
    id: number;
    name: string;
}

interface LocationDetailData {
    mediaUrlTypes: string[];
    mediaUrls: string[];
}

interface BuildingLocation {
    name: string;
    lat: number;
    lng: number;
    imageURLs: string[];
}

// https://map.uci.edu/?id=463#!s/?ct/8424,8309,8311,8392,8405,44392,44393,44394,44395,44396,44397,44398,44400,44401,44402,44538,44537,44399,8396,11907,8400,10486,11906,11889,8310,8312,8393,8394,8397,8398,8399,8404,8407,8408,11891,11892,11899,11900,11902,21318,8406,11908,11935
// Select locations from only specific categories (category IDs are sourced from link above)
const CATEGORIES: Set<number> = new Set([
    8424, 8309, 8311, 8392, 8405, 44392, 44393, 44394, 44395, 44396, 44397, 44398, 44400, 44401, 44402, 44538, 44537,
    44399, 8396, 11907, 8400, 10486, 11906, 11889, 8310, 8312, 8393, 8394, 8397, 8398, 8399, 8404, 8407, 8408, 11891,
    11892, 11899, 11900, 11902, 21318, 8406, 11908, 11935,
]);

const LOCATIONS_LIST_API = 'https://api.concept3d.com/locations?map=463&key=0001085cc708b9cef47080f064612ca5';
const LOCATIONS_DETAIL_API = (id: number) =>
    `https://api.concept3d.com/locations/${id}?map=463&key=0001085cc708b9cef47080f064612ca5`;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchLocations(): Promise<{
    catalogue: Record<number, BuildingLocation>;
    locationIds: Record<string, number>;
}> {
    const locationsCatalogue: Record<number, BuildingLocation> = {};
    const locationIds: Record<string, number> = {};

    console.log('Fetching location list from Concept3D API...');
    const locationsListResponse: Response = await fetch(LOCATIONS_LIST_API);
    const locations: LocationListData[] = await locationsListResponse.json();
    console.log(`Found ${locations.length} total locations, filtering by category...`);

    let processed = 0;

    for (const location of locations) {
        // Check if location was already recorded
        const locationExists: boolean = Object.values(locationsCatalogue).some(
            (existingLocation) => existingLocation.name === location.name
        );

        if (!CATEGORIES.has(location.catId)) continue;
        if (locationExists) continue;

        // Hits location data API to get details on location
        const locationsDetailResponse: Response = await fetch(LOCATIONS_DETAIL_API(location.id));
        const locationData: LocationDetailData = await locationsDetailResponse.json();

        const imgUrls: string[] = [];

        // Collects image URLs by checking if type is an image
        if (locationData.mediaUrlTypes !== undefined) {
            for (const [i, media] of locationData.mediaUrlTypes.entries()) {
                if (media === 'image') {
                    imgUrls.push(locationData.mediaUrls[i]);
                }
            }
        }

        locationsCatalogue[location.id] = {
            name: location.name,
            lat: location.lat,
            lng: location.lng,
            imageURLs: imgUrls,
        };

        const locationName: string = location.name.includes('(')
            ? location.name.substring(location.name.indexOf('(') + 1, location.name.indexOf(')'))
            : location.name;
        locationIds[locationName] = location.id;

        processed++;
        if (processed % 50 === 0) {
            console.log(`Processed ${processed} locations...`);
        }

        await sleep(250);
    }

    console.log(`Finished processing ${processed} locations.`);
    return { catalogue: locationsCatalogue, locationIds };
}

async function main() {
    const { catalogue, locationIds } = await fetchLocations();

    const buildingCatalogueContent = `export interface Building {
    imageURLs: string[];
    lat: number;
    lng: number;
    name: string;
}

const buildingCatalogue: Record<string, Building> = ${JSON.stringify(catalogue, null, 4)};
export default buildingCatalogue;
`;

    const locationsContent = `const locations: Record<string, number> = ${JSON.stringify(locationIds, null, 4)};
export default locations;
`;

    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(BUILDING_CATALOGUE_FILE, buildingCatalogueContent);
    await writeFile(LOCATIONS_FILE, locationsContent);

    console.log('Location data generated.');
    console.log(`  - Building catalogue: ${BUILDING_CATALOGUE_FILE}`);
    console.log(`  - Locations: ${LOCATIONS_FILE}`);
}

main();
