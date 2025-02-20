import FeedbackIcon from '@mui/icons-material/Feedback';
import HelpIcon from '@mui/icons-material/Help';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Fab, Tooltip, Box, IconButton, keyframes } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import RightPaneStore from '$components/RightPane/RightPaneStore';

import { Tutorial } from '$components/Tutorial';
import Feedback from '$routes/Feedback';
import { useTour } from '@reactour/tour';

export function HelpMenu() {
    const [isHovered, setIsHovered] = useState(false);
    const [hoverLock, setHoverLock] = useState(false);
    const collapseTimeout = useRef<NodeJS.Timeout | null>(null);
    const [showHelpBox, setShowHelpBox] = useState(RightPaneStore.getHelpBoxVisible());
    const [isMobile, setIsMobile] = useState(false);
    const { isOpen } = useTour();

    const checkIsMobile = () => {
        setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    };

    useEffect(() => {
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const handleMouseEnter = () => {
        if (hoverLock && collapseTimeout.current) {
            clearTimeout(collapseTimeout.current);
            collapseTimeout.current = null;
        }
        if (!isMobile) {
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            collapseTimeout.current = setTimeout(() => {
                setHoverLock(false);
                setIsHovered(false);
                collapseTimeout.current = null;
            }, 150);
        }
    };

    const handleToggleClick = () => {
        if (isMobile) {
            setHoverLock(!hoverLock);
            setIsHovered(!hoverLock);
        }
    };

    const closeHelpMenu = () => {
        setHoverLock(false); 
        setIsHovered(false);
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

    useEffect(() => {
        if (!isOpen) {
            setIsHovered(false);
        }
    }, [isOpen]);

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

    const styles = {
        buttonBase: {
            backgroundColor: '#fff',
            ':hover': {
                backgroundColor: '#e0f7fa',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', 
            },
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.6)',
            animation: `${riseAnimation} 0.5s ease forwards`,
            opacity: 0,
        },
        fab: {
            width: '4rem',
            height: '4rem',
            position: 'relative',
            transition: 'all 0.3s',
        },
        container: {
            position: 'fixed',
            bottom: '6rem',
            right: '1rem',
            zIndex: 999,
            width: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'center',
            gap: '1rem',
            pointerEvents: 'auto',
        },
        tutorial: {
            animation: `${riseAnimation} 0.5s ease forwards`,
            animationDelay: '0.3s',
            opacity: 0,
        },
    };

    return (
        <Box
            onMouseEnter={handleMouseEnter  }
            onMouseLeave={handleMouseLeave}
            sx={styles.container}
        >
            <Tooltip title="Help Menu">
                <Fab
                    color="primary"
                    aria-label="Help Menu"
                    onClick={isMobile ? handleToggleClick : undefined}
                    sx={styles.fab}
                >
                    <LightbulbIcon />
                </Fab>
            </Tooltip>

            {(isHovered && !isOpen) && (
                <Box
                    sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', }}
                >
                    {!isMobile && (
                        <Box
                            sx={styles.tutorial}
                        >
                            <Tutorial/>
                        </Box>
                    )}

                    <Tooltip title="Feedback Form">
                        <IconButton
                            color="primary"
                            onClick={() => {
                                Feedback(); 
                                closeHelpMenu();
                            }}
                            size="large"
                            sx={{...styles.buttonBase, animationDelay: '0.2s',}}
                        >
                            <FeedbackIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Help Box">
                        <IconButton
                            color="primary"
                            onClick={() => {
                                RightPaneStore.toggleHelpBox();
                                closeHelpMenu();
                            }}
                            size="large"
                            sx={{...styles.buttonBase, animationDelay: '0.1s', }}
                        >
                            <HelpIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Box>
    );
    }
    export default HelpMenu;