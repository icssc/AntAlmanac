import type { WebsocResponse } from '$lib/peterportal.types'
import type { CourseInfo } from '.'

/**
 * get course info from a websoc response
 */
export function getCourseInfo(response: WebsocResponse) {
  const courseInfo: { [sectionCode: string]: CourseInfo } = {}
  for (const school of response.schools) {
    for (const department of school.departments) {
      for (const course of department.courses) {
        for (const section of course.sections) {
          courseInfo[section.sectionCode] = {
            courseDetails: {
              deptCode: department.deptCode,
              courseNumber: course.courseNumber,
              courseTitle: course.courseTitle,
              courseComment: course.courseComment,
              prerequisiteLink: course.prerequisiteLink,
            },
            section: section,
          }
        }
      }
    }
  }
  return courseInfo
}

/**
 * combine and flatten multiple websoc responses
 */
export function combineSOCObjects(responses: WebsocResponse[]) {
  const combined = responses.shift() as WebsocResponse
  for (const res of responses) {
    for (const school of res.schools) {
      const schoolIndex = combined.schools.findIndex((s) => s.schoolName === school.schoolName)
      if (schoolIndex !== -1) {
        for (const dept of school.departments) {
          const deptIndex = combined.schools[schoolIndex].departments.findIndex((d) => d.deptCode === dept.deptCode)
          if (deptIndex !== -1) {
            const courses = new Set(combined.schools[schoolIndex].departments[deptIndex].courses)
            for (const course of dept.courses) {
              courses.add(course)
            }
            const coursesArray = Array.from(courses)
            coursesArray.sort(
              (left, right) =>
                parseInt(left.courseNumber.replace(/\D/g, '')) - parseInt(right.courseNumber.replace(/\D/g, ''))
            )
            combined.schools[schoolIndex].departments[deptIndex].courses = coursesArray
          } else {
            combined.schools[schoolIndex].departments.push(dept)
          }
        }
      } else {
        combined.schools.push(school)
      }
    }
  }
  return combined
}

/**
 * TODO: import a schedule and save it directly to the store
 */
export function importSchedule() {
}
