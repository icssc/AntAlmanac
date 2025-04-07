import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { mapSearch } from '../testConfig';
import { closeStartPopups, getNewTab } from '../utils/helpers';

export class MapPage {
    private mapContainer: Locator;
    private mapPopup: Locator;

    constructor(public readonly page: Page) {
        this.mapContainer = this.page.getByTestId('map-pane');
        this.mapPopup = this.mapContainer.locator('.leaflet-popup');
    }

    async setUp() {
        await this.page.goto('/');
        await closeStartPopups(this.page);
        await this.goToMapPage();
    }

    async goToMapPage() {
        const mapTab = this.page.locator('#map-tab');
        await mapTab.click();
        await expect(this.mapContainer).toBeVisible();
    }

    async getLocMarker() {
        const marker = this.mapContainer.locator('.leaflet-marker-icon');
        return marker;
    }

    async getLocPopupText() {
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
        const searchBox = this.mapContainer.getByRole('combobox');
        await expect(searchBox).toBeVisible();

        await searchBox.fill(mapSearch.location);
        const autofillOptions = this.page.getByRole('listbox');
        const option = autofillOptions.getByRole('option').nth(0);
        await option.click();
    }
}
