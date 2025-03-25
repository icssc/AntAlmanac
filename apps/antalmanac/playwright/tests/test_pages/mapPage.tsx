import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { mapSearch, search } from '../config';
import { closePopups, verifyNewTabDomain } from '../testTools';

import { CourseRowPage } from './courseRowPage';

export class MapPage {
    private mapContainer: Locator;
    private mapPopup: Locator;

    constructor(public readonly page: Page) {
        this.page = page;
        this.mapContainer = this.page.getByTestId('map-pane');
        this.mapPopup = this.mapContainer.locator('.leaflet-popup');
    }

    async setUp() {
        await this.page.goto('/');
        await closePopups(this.page);
        await this.goToMapPage();
    }

    async goToMapPage() {
        const mapTab = await this.page.locator('#map-tab');
        await mapTab.click();
        this.mapContainer = await this.page.getByTestId('map-pane');
        await this.verifyOnMapPage();
    }

    async verifyOnMapPage() {
        await expect(this.mapContainer).toBeVisible();
    }

    async verifyLocMarker() {
        const marker = await this.mapContainer.locator('.leaflet-marker-icon');
        await expect(marker).toHaveCount(1);
        await marker.click();
    }

    async verifyCourseLocPopup(courseRowPage: CourseRowPage) {
        this.mapPopup = await this.mapContainer.locator('.leaflet-popup');
        await expect(this.mapPopup).toBeVisible();
        const popupInfo = await this.mapPopup.allInnerTexts();
        const popupText = popupInfo[0];
        await expect(popupText).toContain(search.courseName);
        await expect(popupText).toContain(courseRowPage.getCourseLoc());
    }

    async verifyLocPopup() {
        this.mapPopup = await this.mapContainer.locator('.leaflet-popup');
        await expect(this.mapPopup).toBeVisible();
        const popupText = await this.mapPopup.allInnerTexts();
        await expect(popupText.join('')).toContain(mapSearch.location);
    }

    async verifyPopupDirections() {
        const action = async () => {
            const directionButton = this.mapPopup.getByText('Directions');
            await directionButton.click();
        };
        await verifyNewTabDomain(this.page, 'https://www.google.com/maps', action);
    }

    async searchMapLocation() {
        const searchBox = await this.mapContainer.getByRole('combobox');
        await expect(searchBox).toBeVisible();

        await searchBox.fill(mapSearch.location);
        const autofillOptions = await this.page.getByRole('listbox');
        const option = await autofillOptions.getByRole('option').nth(0);
        await option.click();
    }
}
