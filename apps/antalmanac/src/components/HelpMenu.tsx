import FeedbackIcon from '@mui/icons-material/Feedback';
import HelpIcon from '@mui/icons-material/Help';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ReplayIcon from '@mui/icons-material/Replay';
import { Fab, Tooltip, Box, IconButton } from '@mui/material';
import { useTour } from '@reactour/tour';
import React, { useState } from 'react';

import HelpBox from '$components/RightPane/CoursePane/SearchForm/HelpBox';
import Feedback from '$routes/Feedback';

export function HelpMenu() {
    const [isHovered, setIsHovered] = useState(false);
    const [showHelpBox, setShowHelpBox] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const { setIsOpen } = useTour();

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const openFeedbackForm = () => {
        Feedback();
    };

    const openHelpBox = () => {
        setShowHelpBox(true);
    };

    const closeHelpBox = () => {
        setShowHelpBox(false);
    };

    const openTutorial = () => {
        setIsOpen(true);
    };

    return (
        <Box
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
                position: 'fixed',
                bottom: '1rem',
                right: '1rem',
                zIndex: 999,
            }}
        >
            {/* Main Help Menu Icon */}
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

            {/* Hovered Icons */}
            {isHovered && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '5rem',
                        right: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'opacity 0.3s',
                    }}
                >
                    {/* Tutorial Button */}
                    <Tooltip title="Restart Tutorial">
                        <IconButton
                            color="primary"
                            onClick={openTutorial}
                            size="large"
                            sx={{
                                backgroundColor: '#fff',
                                ':hover': { backgroundColor: '#e0f7fa' },
                            }}
                        >
                            <ReplayIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Feedback Form Button */}
                    <Tooltip title="Feedback Form">
                        <IconButton
                            color="primary"
                            onClick={openFeedbackForm}
                            size="large"
                            sx={{
                                backgroundColor: '#fff',
                                ':hover': { backgroundColor: '#e0f7fa' },
                            }}
                        >
                            <FeedbackIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Help Box Button */}
                    <Tooltip title="Help Box">
                        <IconButton
                            color="primary"
                            onClick={openHelpBox}
                            size="large"
                            sx={{
                                backgroundColor: '#fff',
                                ':hover': { backgroundColor: '#e0f7fa' },
                            }}
                        >
                            <HelpIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

            {/* Show HelpBox */}
            {showHelpBox && (
                <Box
                    onMouseEnter={handleMouseLeave}
                >
                    <HelpBox onDismiss={closeHelpBox} />
                </Box>
            )}
        </Box>
    );
}

export default HelpMenu;
