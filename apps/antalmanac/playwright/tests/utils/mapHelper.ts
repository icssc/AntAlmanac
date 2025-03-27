import { expect } from '@playwright/test';

import { MapPage } from '../pages/mapPage';

export const verifyLocMarker = async (mapPage: MapPage) => {
    const marker = await mapPage.getLocMarker();
    await expect(marker).toHaveCount(1);
    await marker.click();
};

export const verifyPopupDirections = async (mapPage: MapPage) => {
    const newTab = await mapPage.getPopupDirections();
    const url = newTab.url();
    await expect(url).toContain('https://www.google.com/maps');
    await newTab.close();
};
