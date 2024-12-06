import { Box, useMediaQuery } from '@material-ui/core';

import { MOBILE_BREAKPOINT } from '../../../../../src/globals';

import { SectionTableCell } from '$components/RightPane/SectionTable/cells/section-table-cell';

export type SectionType = 'Act' | 'Col' | 'Dis' | 'Fld' | 'Lab' | 'Lec' | 'Qiz' | 'Res' | 'Sem' | 'Stu' | 'Tap' | 'Tut';

const SectionDetailsColors: Record<SectionType, string> = {
    Act: '#c87137',
    Col: '#ff40b5',
    Dis: '#ff6e00',
    Fld: '#1ac805',
    Lab: '#1abbe9',
    Lec: '#d40000',
    Qiz: '#8e5c41',
    Res: '#ff2466',
    Sem: '#2155ff',
    Stu: '#179523',
    Tap: '#8d2df0',
    Tut: '#ffc705',
};

interface SectionDetailCellProps {
    sectionType: SectionType;
    sectionNum: string;
    units: number;
}

export function SectionDetailsCell(props: SectionDetailCellProps) {
    const { sectionType, sectionNum, units } = props;
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);

    return (
        <SectionTableCell style={isMobileScreen ? { textAlign: 'center' } : {}}>
            <Box style={{ color: SectionDetailsColors[sectionType] }}>{sectionType}</Box>
            <Box>
                {!isMobileScreen && <>Sec: </>}
                {sectionNum}
            </Box>
            <Box>
                {!isMobileScreen && <>Units: </>}
                {units}
            </Box>
        </SectionTableCell>
    );
}
