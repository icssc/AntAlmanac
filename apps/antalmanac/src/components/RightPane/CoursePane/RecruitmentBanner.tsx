import { Close } from '@mui/icons-material';
import { Alert, Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';

import RightPaneStore from '$components/RightPane/RightPaneStore';
import { getLocalStorageRecruitmentDismissalTime, setLocalStorageRecruitmentDismissalTime } from '$lib/localStorage';
import { useThemeStore } from '$stores/SettingsStore';

export function RecruitmentBanner() {
    const { isDark } = useThemeStore();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [bannerVisibility, setBannerVisibility] = useState(true);

    // Display recruitment banner if more than 11 weeks (in ms) has passed since last dismissal
    const recruitmentDismissalTime = getLocalStorageRecruitmentDismissalTime();
    const dismissedRecently =
        recruitmentDismissalTime !== null &&
        Date.now() - parseInt(recruitmentDismissalTime) < 11 * 7 * 24 * 3600 * 1000;
    const isSearchCS = ['COMPSCI', 'IN4MATX', 'I&C SCI', 'STATS'].includes(
        RightPaneStore.getFormData().deptValue.toUpperCase()
    );
    const displayRecruitmentBanner = bannerVisibility && !dismissedRecently && isSearchCS;

    return (
        <Box sx={{ position: 'fixed', bottom: 5, right: isMobile ? 5 : 75, zIndex: 999 }}>
            {displayRecruitmentBanner ? (
                <Alert
                    icon={false}
                    severity="info"
                    style={{
                        color: isDark ? '#ece6e6' : '#2e2e2e',
                        backgroundColor: isDark ? '#2e2e2e' : '#ece6e6',
                    }}
                    action={
                        <IconButton
                            aria-label="close"
                            size="small"
                            color="inherit"
                            onClick={() => {
                                setLocalStorageRecruitmentDismissalTime(Date.now().toString());
                                setBannerVisibility(false);
                            }}
                        >
                            <Close fontSize="inherit" />
                        </IconButton>
                    }
                >
                    Interested in web development?
                    <br />
                    <a href="https://forms.gle/v32Cx65vwhnmxGPv8" target="__blank" rel="noopener noreferrer">
                        Join ICSSC and work on AntAlmanac and other projects!
                    </a>
                    <br />
                    We have opportunities for experienced devs and those with zero experience!
                </Alert>
            ) : null}
        </Box>
    );
}
