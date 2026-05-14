import { ToolbarOverflowMenu } from '$components/ScheduleToolbar/ToolbarOverflowMenu';
import { useIsMobile } from '$hooks/useIsMobile';
import { useFallbackStore } from '$stores/FallbackStore';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';

interface ToolbarResponsiveClusterProps {
    always?: ReactNode;
    wide?: ReactNode;
    narrowMenu?: ReactNode;
}

/**
 * Responsive cluster that sits after undo/redo in the toolbar.
 * - `always`: items always shown inline (e.g. CustomEventDialog, NotificationsDialog).
 * - `wide`: items shown inline only on wide layouts (e.g. ScreenshotButton, DownloadButton).
 * - `narrowMenu`: MenuItems rendered inside ToolbarOverflowMenu on narrow layouts.
 *
 * Uses both container queries (toolbar <500px) and useIsMobile for fallback.
 */
export function ToolbarResponsiveCluster({ always, wide, narrowMenu }: ToolbarResponsiveClusterProps) {
    const isMobile = useIsMobile();
    const fallbackMode = useFallbackStore((state) => state.fallbackMode);

    return (
        <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
            {always}

            {wide && (
                <Box
                    sx={{
                        display: isMobile ? 'none' : 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        '@container toolbar (max-width: 500px)': {
                            display: 'none',
                        },
                    }}
                >
                    {wide}
                </Box>
            )}

            {narrowMenu && (
                <Box
                    sx={{
                        display: isMobile ? 'flex' : 'none',
                        '@container toolbar (max-width: 500px)': {
                            display: 'flex',
                        },
                    }}
                >
                    <ToolbarOverflowMenu disabled={fallbackMode}>{narrowMenu}</ToolbarOverflowMenu>
                </Box>
            )}
        </Box>
    );
}
