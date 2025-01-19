import FeedbackIcon from '@mui/icons-material/Feedback';
import HelpIcon from '@mui/icons-material/Help';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Fab, Tooltip, Box, IconButton, Paper, keyframes } from '@mui/material';
import { useEffect, useState, useRef} from 'react';
import RightPaneStore from '$components/RightPane/RightPaneStore';

import HelpBox from '$components/RightPane/CoursePane/SearchForm/HelpBox';
import { Tutorial } from '$components/Tutorial';
import Feedback from '$routes/Feedback';

export function HelpMenu() {
    const [isHovered, setIsHovered] = useState(false);
    const [hoverLock, setHoverLock] = useState(false);
    const collapseTimeout = useRef<NodeJS.Timeout | null>(null);
    const [showHelpBox, setShowHelpBox] = useState(RightPaneStore.getHelpBoxVisible());

    const handleMouseEnter = () => {
        if (hoverLock && collapseTimeout.current) {
            clearTimeout(collapseTimeout.current);
            collapseTimeout.current = null;
        }
        setIsHovered(true);
        setHoverLock(true);
    };

    const handleMouseLeave = () => {
        collapseTimeout.current = setTimeout(() => {
            setHoverLock(false);
            setIsHovered(false);
            collapseTimeout.current = null;
        }, 1000);
    };

    const handleButtonClick = () => {
        console.log("test");
        setHoverLock(false);
        setIsHovered(false);
    }

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
            onMouseLeave={handleMouseLeave}
            sx={{
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

            {(isHovered) && (
                <Box
                    sx={{
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
                        <Tutorial/>
                    </Box>

                    <Tooltip title="Feedback Form">
                        <IconButton
                            color="primary"
                            onClick={() => {
                                Feedback();
                                //handleButtonClick();
                            }}
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
                            onClick={() => {
                                RightPaneStore.toggleHelpBox();
                                handleButtonClick();
                            }}
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
        </Box>
    );
}

export default HelpMenu;