import { useScheduleStore } from '$stores/schedule'
import type { WebsocResponse, School, Department, AACourse, AASection } from '$types/peterportal'

/**
 * flattens the websoc response
 */
export function flattenSOCObject(SOCObject: WebsocResponse) {
  const { schedules, scheduleIndex } = useScheduleStore.getState()

  const courses = schedules[scheduleIndex]?.courses || []

  const courseColors = courses.reduce((accumulator, { section }) => {
    accumulator[section.sectionCode] = section.color
    return accumulator
  }, {} as { [key: string]: string })

  const reduced = SOCObject?.schools?.reduce((accumulator, school) => {
    accumulator.push(school)
    school.departments.forEach((dept) => {
      accumulator.push(dept)
      dept.courses.forEach((course) => {
        for (const section of course.sections) {
          ;(section as AASection).color = courseColors[section.sectionCode]
        }
        accumulator.push(course as AACourse)
      })
    })
    return accumulator
  }, [] as (School | Department | AACourse)[])

  return reduced || []
}
