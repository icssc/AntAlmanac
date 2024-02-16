import { describe, test, expect } from 'vitest';
import locationIds from '$lib/location_ids';
import buildingCatalogue from '$lib/buildingCatalogue';

describe('locationIds', () => {
    test('no duplicate names', () => {
        const names = Object.keys(locationIds);
        const uniqueNames = new Set(names);
        expect(names.length).toBe(uniqueNames.size);
    });
});

describe('buildingCatalogue', () => {
    test('no duplicate names', () => {
        const names = Object.values(buildingCatalogue).map((building) => building.name);
        const uniqueNames = new Set(names);
        expect(names.length).toBe(uniqueNames.size);
    });
});

describe('locationIds and buildingCatalogue', () => {
    test('all locationIds are in buildingCatalogue', () => {
        const locationNames = Object.keys(locationIds);
        const buildingNames = Object.values(buildingCatalogue).map((building) => building.name);
        for (const locationName of locationNames) {
            expect(buildingNames).toContain(locationName);
        }
    });

    test('all buildingCatalogue are in locationIds', () => {
        const locationNames = Object.keys(locationIds);
        const buildingNames = Object.values(buildingCatalogue).map((building) => building.name);
        for (const buildingName of buildingNames) {
            expect(locationNames).toContain(buildingName);
        }
    });
});
