import FeedbackIcon from '@mui/icons-material/Feedback';
import HelpIcon from '@mui/icons-material/Help';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Fab, Tooltip, Box, IconButton, Paper, keyframes } from '@mui/material';
import { useEffect, useState, useRef, useCallback} from 'react';
import RightPaneStore from '$components/RightPane/RightPaneStore';

import { Tutorial } from '$components/Tutorial';
import Feedback from '$routes/Feedback';

export function HelpMenu() {
    const [isHovered, setIsHovered] = useState(false);
    const [hoverLock, setHoverLock] = useState(false);
    const collapseTimeout = useRef<NodeJS.Timeout | null>(null);
    const [showHelpBox, setShowHelpBox] = useState(RightPaneStore.getHelpBoxVisible());
    const [isMobile, setIsMobile] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.matchMedia('(pointer: coarse)').matches);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
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
            if (hoverLock) {
                setHoverLock(false);
                setIsHovered(false);
            } else {
                setHoverLock(true);
                setIsHovered(true);
            }
        }
    };

    const handleButtonClick = () => {
        setHoverLock(false); 
        setIsHovered(false);
    };

    const openTutorial = () => {
        handleToggleClick();    
        setIsTutorialOpen(true);
    };

    const dismissTutorial = useCallback(() => {
        console.log("test");
        setIsTutorialOpen(false);
    }, []);

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

            {(isHovered && !isTutorialOpen) && (
                <Box
                    sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', }}
                >
                    {!isMobile && (
                        <Box
                            onClick={(e) => {
                                e.stopPropagation();7
                                openTutorial();
                            }}
                            sx={styles.tutorial}
                        >
                            <Tutorial onClick={handleToggleClick} onDismiss={dismissTutorial} />
                        </Box>
                    )}

                    <Tooltip title="Feedback Form">
                        <IconButton
                            color="primary"
                            onClick={() => {Feedback(); handleToggleClick();}}
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
                                handleButtonClick();
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