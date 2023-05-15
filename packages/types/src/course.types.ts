import { WebsocSection, WebsocCourse } from 'peterportal-api-next-types'

export interface AASection extends WebsocSection {
    /** A hex RGB string prefixed by #. Added since we inject this after receiving the API response. */
    color: string;
}

export interface AACourse extends WebsocCourse {
    sections: AASection[];
    deptCode: string;
}
