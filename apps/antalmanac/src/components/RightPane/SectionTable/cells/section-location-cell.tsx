import { Box } from '@material-ui/core';
import { WebsocSectionMeeting } from '@packages/antalmanac-types';
import { Fragment, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { SectionTableCell } from '$components/RightPane/SectionTable/cells/section-table-cell';
import locationIds from '$lib/location_ids';
import { useThemeStore } from '$stores/SettingsStore';
import { useTabStore } from '$stores/TabStore';

interface SectionLocationsCellProps {
    meetings: WebsocSectionMeeting[];
}

export function SectionLocationCell({ meetings }: SectionLocationsCellProps) {
    const isDark = useThemeStore((store) => store.isDark);
    const { setActiveTab } = useTabStore();

    const focusMap = useCallback(() => {
        setActiveTab(2);
    }, [setActiveTab]);

    return (
        <SectionTableCell>
            {meetings.map((meeting) => {
                return !meeting.timeIsTBA ? (
                    meeting.bldg.map((bldg) => {
                        const [buildingName = ''] = bldg.split(' ');
                        const buildingId = locationIds[buildingName];
                        return (
                            <Fragment key={meeting.timeIsTBA + bldg}>
                                <Link
                                    to={`/map?location=${buildingId}`}
                                    onClick={focusMap}
                                    color={isDark ? 'dodgerblue' : 'blue'}
                                    style={{
                                        cursor: 'pointer',
                                        background: 'none !important',
                                        border: 'none',
                                        padding: '0 !important',
                                        fontSize: '0.85rem',
                                        textDecoration: 'none',
                                    }}
                                >
                                    {bldg}
                                </Link>
                                <br />
                            </Fragment>
                        );
                    })
                ) : (
                    <Box>{'TBA'}</Box>
                );
            })}
        </SectionTableCell>
    );
}
