import { mergeSx } from '$lib/helpers';
import { ExpandMore } from '@mui/icons-material';
import { Box, Chip, Menu } from '@mui/material';
import { type MouseEvent, type ReactElement, type ReactNode, useEffect, useRef, useState } from 'react';

/** Matches inner fuzzy-search input: 22px tall, 12px type, label horizontal inset. */
const pillSplitButtonSx = {
    height: 22,
    minHeight: 22,
    alignItems: 'stretch',
    borderRadius: 9999,
    fontSize: '12px',
    lineHeight: '17.25px',
    color: 'text.primary',
    '&:hover, &:focus, &.Mui-focusVisible': {
        backgroundColor: 'transparent',
    },
    '& .MuiChip-label': {
        display: 'flex',
        alignItems: 'stretch',
        px: 0,
    },
    // Chip onDelete styles this like a remove button; reset defaults only.
    '&& .MuiChip-deleteIcon': {
        margin: 0,
        color: 'inherit',
        '&:hover': {
            color: 'inherit',
        },
    },
} as const;

const primaryTargetSx = {
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'stretch',
    pr: 0.75,
    cursor: 'pointer',
    borderTopLeftRadius: 9999,
    borderBottomLeftRadius: 9999,
    '&:hover': {
        bgcolor: 'action.hover',
    },
} as const;

const menuToggleSx = {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'stretch',
    boxSizing: 'border-box',
    px: 0.75,
    minWidth: 24,
    borderLeft: 1,
    borderColor: 'divider',
    color: 'inherit',
    cursor: 'pointer',
    borderTopRightRadius: 9999,
    borderBottomRightRadius: 9999,
    '&:hover': {
        bgcolor: 'action.hover',
    },
} as const;

interface PillSplitButtonProps {
    label: ReactNode;
    onPrimaryClick: () => void;
    icon?: ReactElement;
    disabled?: boolean;
    open?: boolean;
    onToggleMenu?: () => void;
    onCloseMenu?: () => void;
    toggleAriaLabel?: string;
    children?: ReactNode;
}

export function PillSplitButton({
    label,
    onPrimaryClick,
    icon,
    disabled,
    open = false,
    onToggleMenu,
    onCloseMenu,
    toggleAriaLabel = 'Show more options',
    children,
}: PillSplitButtonProps) {
    const anchorRef = useRef<HTMLDivElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const menuEnabled = Boolean(children) && onToggleMenu !== undefined && onCloseMenu !== undefined && !disabled;

    useEffect(() => {
        if (!open) {
            setAnchorEl(null);
        }
    }, [open]);

    const handleToggleMenu = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        if (open) {
            onCloseMenu?.();
            return;
        }

        setAnchorEl(anchorRef.current);
        onToggleMenu?.();
    };

    const primaryLabel = (
        <Box
            component="span"
            onClick={disabled ? undefined : onPrimaryClick}
            sx={mergeSx(
                primaryTargetSx,
                !icon ? { pl: 1.5 } : undefined,
                disabled ? { cursor: 'default', '&:hover': { bgcolor: 'transparent' } } : undefined
            )}
        >
            {icon ? (
                <Box component="span" sx={{ display: 'flex', ml: 1.5, mr: 0.5, fontSize: 14, width: 14, height: 14 }}>
                    {icon}
                </Box>
            ) : null}
            {label}
        </Box>
    );

    return (
        <>
            <Box ref={anchorRef} sx={{ display: 'inline-flex', maxWidth: '100%' }}>
                <Chip
                    label={primaryLabel}
                    variant="outlined"
                    disabled={disabled}
                    onDelete={menuEnabled ? handleToggleMenu : undefined}
                    deleteIcon={
                        menuEnabled ? (
                            <Box component="span" aria-label={toggleAriaLabel} sx={menuToggleSx}>
                                <ExpandMore
                                    sx={{
                                        fontSize: 16,
                                        display: 'block',
                                        transition: 'transform 0.15s',
                                        transform: open ? 'rotate(180deg)' : undefined,
                                    }}
                                />
                            </Box>
                        ) : undefined
                    }
                    aria-haspopup={menuEnabled ? 'menu' : undefined}
                    aria-expanded={menuEnabled && open ? 'true' : undefined}
                    sx={pillSplitButtonSx}
                />
            </Box>
            {menuEnabled ? (
                <Menu
                    anchorEl={anchorEl}
                    open={open && Boolean(anchorEl)}
                    onClose={onCloseMenu}
                    marginThreshold={4}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    slotProps={{
                        paper: {
                            sx: {
                                mt: 0.5,
                                maxHeight: 300,
                                maxWidth: 280,
                                ...(anchorEl && {
                                    width: anchorEl.offsetWidth,
                                    minWidth: anchorEl.offsetWidth,
                                }),
                            },
                        },
                    }}
                >
                    {children}
                </Menu>
            ) : null}
        </>
    );
}
