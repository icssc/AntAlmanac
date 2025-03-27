import { expect } from '@playwright/test';

import { test } from '../fixtures';
import { mapSearch, search } from '../testConfig';
import { verifyLocMarker, verifyPopupDirections } from '../utils/mapHelper';

test.describe('Map pane tests', () => {
    test('Map shows course location marker and popup', async ({ mapPage, courseSearchPage, courseRowPage }) => {
        await courseSearchPage.setUp();
        await courseRowPage.initCourseRow();
        await mapPage.goToMapPage();

        await verifyLocMarker(mapPage);

        const popupText = await mapPage.getLocPopupText();
        await expect(popupText).toContain(search.courseName);
        await expect(popupText).toContain(courseRowPage.getCourseLoc());

        await verifyPopupDirections(mapPage);
    });

    test('Searching for building shows location on map', async ({ mapPage }) => {
        await mapPage.setUp();
        await mapPage.searchMapLocation();

        await verifyLocMarker(mapPage);

        const popupText = await mapPage.getLocPopupText();
        await expect(popupText).toContain(mapSearch.location);

        await verifyPopupDirections(mapPage);
    });
});
