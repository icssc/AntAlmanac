import { Chip, Tooltip } from '@material-ui/core';
import { useState } from 'react';

import { SectionTableCell } from '$components/RightPane/SectionTable/cells/section-table-cell';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clickToCopy } from '$lib/helpers';
import { useThemeStore } from '$stores/SettingsStore';

interface SectionCourseCodeCellProps {
    sectionCode: string;
}

export function SectionCourseCodeCell(props: SectionCourseCodeCellProps) {
    const isDark = useThemeStore((store) => store.isDark);

    const { sectionCode } = props;

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <SectionTableCell style={{ width: '8%' }}>
            <Tooltip title="Click to copy course code" placement="bottom" enterDelay={150}>
                <Chip
                    onClick={(event) => {
                        clickToCopy(event, sectionCode);
                        logAnalytics({
                            category: analyticsEnum.classSearch.title,
                            action: analyticsEnum.classSearch.actions.COPY_COURSE_CODE,
                        });
                    }}
                    label={sectionCode}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        display: 'inline-flex',
                        cursor: 'pointer',
                        alignSelf: 'center',
                        color: isHovered ? (isDark ? 'gold' : 'blueviolet') : '',
                    }}
                    size="small"
                />
            </Tooltip>
        </SectionTableCell>
    );
}
