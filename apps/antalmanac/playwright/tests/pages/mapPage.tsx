import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { mapSearch } from '../testConfig';
import { closeStartPopups, getNewTab } from '../utils/helpers';

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
        await closeStartPopups(this.page);
        await this.goToMapPage();
    }

    async goToMapPage() {
        const mapTab = await this.page.locator('#map-tab');
        await mapTab.click();
        this.mapContainer = await this.page.getByTestId('map-pane');
        await expect(this.mapContainer).toBeVisible();
    }

    async getLocMarker() {
        const marker = this.mapContainer.locator('.leaflet-marker-icon');
        return marker;
    }

    async getLocPopupText() {
        this.mapPopup = await this.mapContainer.locator('.leaflet-popup');
        await expect(this.mapPopup).toBeVisible();
        const popupInfo = await this.mapPopup.allInnerTexts();
        return popupInfo.join('');
    }

    async getPopupDirections() {
        const action = async () => {
            const directionButton = this.mapPopup.getByText('Directions');
            await directionButton.click();
        };
        const newTab = getNewTab(this.page, action);
        return newTab;
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
