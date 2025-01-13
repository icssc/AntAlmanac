import FeedbackIcon from '@mui/icons-material/Feedback';
import HelpIcon from '@mui/icons-material/Help';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Fab, Tooltip, Box, IconButton, Paper, keyframes } from '@mui/material';
import { useEffect, useState } from 'react';
import RightPaneStore from '$components/RightPane/RightPaneStore';

import HelpBox from '$components/RightPane/CoursePane/SearchForm/HelpBox';
import { Tutorial } from '$components/Tutorial';
import Feedback from '$routes/Feedback';

export function HelpMenu() {
    const [isHovered, setIsHovered] = useState(false);
    const [showHelpBox, setShowHelpBox] = useState(RightPaneStore.getHelpBoxVisible());

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const openFeedbackForm = () => {
        Feedback();
    };

    useEffect(() => {
        const handleHelpBoxChange = (newVisibility: boolean) => {
            setShowHelpBox(newVisibility);
        };
        RightPaneStore.on('helpBoxChange', handleHelpBoxChange);

        return () => {
            RightPaneStore.off('helpBoxChange', handleHelpBoxChange);
        };
    }, []);

    const riseAnimation = keyframes`
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
`;


    return (
        <Box
            onMouseEnter={handleMouseEnter}
            sx={{
                position: 'fixed',
                bottom: '6rem',
                right: '1rem',
                zIndex: 999,
            }}
        >
            <Tooltip title="Help Menu">
                <Fab
                    color="primary"
                    aria-label="Help Menu"
                    sx={{
                        width: '4rem',
                        height: '4rem',
                        position: 'relative',
                        transition: 'all 0.3s',
                    }}
                >
                    <LightbulbIcon />
                </Fab>
            </Tooltip>

            {isHovered && (
                <Box
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{
                        position: 'absolute',
                        bottom: '5rem',
                        right: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                    }}
                >
                    <Box
                        sx={{
                            animation: `${riseAnimation} 0.5s ease forwards`,
                            animationDelay: '0.3s',
                            opacity: 0,
                        }}
                    >
                        <Tutorial />
                    </Box>

                    <Tooltip title="Feedback Form">
                        <IconButton
                            color="primary"
                            onClick={openFeedbackForm}
                            size="large"
                            sx={{
                                backgroundColor: '#fff',
                                ':hover': { backgroundColor: '#e0f7fa' },
                                animation: `${riseAnimation} 0.5s ease forwards`,
                                animationDelay: '0.2s', 
                                opacity: 0,
                            }}
                        >
                            <FeedbackIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Help Box">
                        <IconButton
                            color="primary"
                            onClick={() => RightPaneStore.toggleHelpBox()}
                            size="large"
                            sx={{
                                backgroundColor: '#fff',
                                ':hover': { backgroundColor: '#e0f7fa' },
                                animation: `${riseAnimation} 0.5s ease forwards`,
                                animationDelay: '0.1s', 
                                opacity: 0,
                            }}
                        >
                            <HelpIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

            {showHelpBox && (
                <Box
                    sx={{
                        position: 'fixed',
                        right: '1rem',
                        bottom: '5rem',
                        width: '50%',
                        height: 'auto',
                        zIndex: 1000,
                        overflow: 'auto',
                    }}
                >
                    <Paper variant="outlined" sx={{ padding: 2, boxShadow: 3 }}>
                        <HelpBox onDismiss={() => RightPaneStore.hideHelpBox()} />
                    </Paper>
                </Box>
            )}
        </Box>
    );
}

export default HelpMenu;
