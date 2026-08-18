import { getLocalStorageRecruitmentDismissalTime, setLocalStorageRecruitmentDismissalTime } from '$lib/localStorage';
import { PROJECTS_LINK } from '$src/globals';
import { Close } from '@mui/icons-material';
import { Alert, Box, IconButton, useTheme } from '@mui/material';
import { useState } from 'react';

const RELEVANT_DEPARTMENTS = ['COMPSCI', 'IN4MATX', 'I&C SCI', 'STATS', 'CSE', 'EECS', 'SWE', 'GDIM', 'COGS'];

interface RecruitmentBannerProps {
    deptValue: string;
}

export function RecruitmentBanner({ deptValue }: RecruitmentBannerProps) {
    const [bannerVisibility, setBannerVisibility] = useState(true);
    const theme = useTheme();

    const recruitmentDismissalTime = getLocalStorageRecruitmentDismissalTime();
    const dismissedRecently =
        recruitmentDismissalTime !== null &&
        Date.now() - parseInt(recruitmentDismissalTime) < 11 * 7 * 24 * 3600 * 1000;
    const isRelevantDept = RELEVANT_DEPARTMENTS.includes(deptValue.toUpperCase());
    const displayRecruitmentBanner = bannerVisibility && !dismissedRecently && isRelevantDept;

    const handleClick = () => {
        setLocalStorageRecruitmentDismissalTime(Date.now().toString());
        setBannerVisibility(false);
    };

    return (
        <Box
            sx={(theme) => ({
                position: 'fixed',
                bottom: 5,
                right: 5,
                zIndex: theme.zIndex.snackbar,
            })}
        >
            {displayRecruitmentBanner ? (
                <Alert
                    icon={false}
                    severity="info"
                    style={{
                        color: 'unset',
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    action={
                        <IconButton aria-label="close" size="small" color="inherit" onClick={handleClick}>
                            <Close fontSize="inherit" />
                        </IconButton>
                    }
                >
                    Interested in software development?
                    <br />
                    We have opportunities for developers and designers of all skill levels.
                    <br />
                    <a href={PROJECTS_LINK} target="_blank" rel="noopener noreferrer">
                        Join ICSSC and work on AntAlmanac and other projects!
                    </a>
                </Alert>
            ) : null}
        </Box>
    );
}
