
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { AACourse } from '../../../peterportal.types';

export interface SectionTableProps {
    classes: ClassNameMap
    courseDetails: AACourse
    term: string
    colorAndDelete: boolean
    highlightAdded: boolean
    scheduleNames: string[]
    analyticsCategory: string
}