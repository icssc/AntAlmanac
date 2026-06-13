import { mergeSx } from '$lib/helpers';
import { ExpandMore } from '@mui/icons-material';
import { Box, Chip, Menu, type ChipProps } from '@mui/material';
import { type MouseEvent, type ReactElement, type ReactNode, Children, useRef } from 'react';

interface PillSplitButtonProps extends Omit<
    ChipProps,
    'label' | 'icon' | 'onDelete' | 'deleteIcon' | 'onClick' | 'variant' | 'children' | 'clickable'
> {
    label: ReactNode;
    onPrimaryClick: () => void;
    icon?: ReactElement;
    open?: boolean;
    onToggleMenu?: () => void;
    onCloseMenu?: () => void;
    menuWidth?: number;
    children?: ReactNode;
}

const pillSplitButtonSx = {
    height: 25,
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
        flex: 1,
        minWidth: 0,
        px: 0,
    },
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
    flex: 1,
    minWidth: 0,
    pl: 1.5,
    pr: 1.5,
    cursor: 'pointer',
    borderRadius: '9999px 0 0 9999px',
    overflow: 'hidden',
    '& > .MuiSvgIcon-root': {
        mr: 0.5,
        flexShrink: 0,
    },
    '&:hover': {
        bgcolor: 'action.hover',
    },
} as const;

const menuToggleSx = {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'stretch',
    px: 0.75,
    minWidth: 24,
    borderLeft: 1,
    borderColor: 'divider',
    color: 'inherit',
    cursor: 'pointer',
    borderRadius: '0 9999px 9999px 0',
    '&:hover': {
        bgcolor: 'action.hover',
        color: 'inherit',
    },
} as const;

function getMenuPaperSx(menuWidth?: number) {
    return {
        mt: 0.5,
        ...(menuWidth && {
            width: menuWidth,
            minWidth: menuWidth,
            maxWidth: menuWidth,
            boxSizing: 'border-box' as const,
        }),
    };
}

export function PillSplitButton({
    label,
    onPrimaryClick,
    icon,
    disabled,
    open = false,
    onToggleMenu,
    onCloseMenu,
    menuWidth,
    children,
    sx,
    ...chipProps
}: PillSplitButtonProps) {
    const anchorRef = useRef<HTMLDivElement>(null);

    const hasMenuOptions =
        !disabled && onToggleMenu !== undefined && onCloseMenu !== undefined && Children.toArray(children).length > 0;

    const handleToggleMenu = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        if (open) {
            onCloseMenu?.();
            return;
        }
        onToggleMenu?.();
    };

    const handlePrimaryClick = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        if (!disabled) {
            onPrimaryClick();
        }
    };

    return (
        <>
            <Chip
                {...chipProps}
                ref={anchorRef}
                label={
                    <Box
                        component="span"
                        onClick={disabled ? undefined : handlePrimaryClick}
                        sx={mergeSx(
                            primaryTargetSx,
                            !hasMenuOptions ? { borderRadius: 9999 } : undefined,
                            disabled ? { cursor: 'default', '&:hover': { bgcolor: 'transparent' } } : undefined
                        )}
                    >
                        {icon}
                        {label}
                    </Box>
                }
                variant="outlined"
                disabled={disabled}
                onDelete={hasMenuOptions ? handleToggleMenu : undefined}
                deleteIcon={
                    hasMenuOptions ? (
                        <Box component="span" aria-label="Show more options" sx={menuToggleSx}>
                            <ExpandMore sx={{ transform: open ? 'rotate(180deg)' : undefined }} />
                        </Box>
                    ) : undefined
                }
                aria-haspopup={hasMenuOptions ? 'menu' : undefined}
                aria-expanded={hasMenuOptions && open ? 'true' : undefined}
                sx={mergeSx(pillSplitButtonSx, sx)}
            />

            {hasMenuOptions ? (
                <Menu
                    anchorEl={anchorRef.current}
                    open={open}
                    onClose={onCloseMenu}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    slotProps={{ paper: { sx: getMenuPaperSx(menuWidth) } }}
                >
                    {children}
                </Menu>
            ) : null}
        </>
    );
}
