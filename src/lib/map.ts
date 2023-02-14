import { getCourseCalendarEvents } from '$stores/schedule/calendar';
import type { CourseCalendarEvents } from '$stores/schedule/calendar';
import type { Course } from '$stores/schedule';
import locations from '$lib/locations';
import buildingCatalogue from '$lib/buildingCatalogue';

export function getMarkersFromCourses(courses: Course[]) {
  const events = getCourseCalendarEvents(courses);

  const uniqueBuildingCodes = new Set(events.map((event) => event.bldg.split(' ').slice(0, -1).join(' ')));

  const pins: Record<string, CourseCalendarEvents> = {};

  /**
   * associate each building code to courses that have a matching building code
   */
  uniqueBuildingCodes.forEach((buildingCode) => {
    pins[buildingCode] = events.filter((event) => {
      const eventBuildingCode = event.bldg.split(' ').slice(0, -1).join(' ');
      return eventBuildingCode === buildingCode;
    });
  });

  const result = Object.entries(pins)
    .filter(([buildingCode]) => !!buildingCatalogue[locations[buildingCode]])
    .map(([buildingCode, events]) => {
      const locationData = buildingCatalogue[locations[buildingCode]];
      const eventLocationData = events.map((event) => {
        const key = `${event.title} ${event.sectionType} @ ${event.bldg}`;
        const acronym = locationData.name.substring(locationData.name.indexOf('(') + 1, locationData.name.indexOf(')'));
        return {
          key,
          image: locationData.imageURLs[0],
          acronym,
          markerColor: event.color,
          location: locationData.name,
          ...locationData,
          ...event,
        };
      });
      const flatEventLocationData = eventLocationData.flat();
      return flatEventLocationData;
    });

  const markers = result.flat();
  return markers;
}
