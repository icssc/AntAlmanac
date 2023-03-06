import type { Course, WebsocSection } from 'peterportal-api-next-types'

/**
 * Same as Section, except also has a color
 */
export interface AASection extends WebsocSection {
  /** A hex RGB string prefixed by #. Added since we inject this after receiving the API response. */
  color: string
}

/**
 * Same as Course, except includes a `deptCode` and sections contains AASection objects, which have colors.
 */
export interface AACourse extends Course {
  sections: AASection[]
  deptCode: string
}

