import { LIGHT_BLUE, PLANNER_LINK } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';
import { Link, MenuItem } from '@mui/material';

interface CreateRoadmapLinkItemProps {
    verticalPadding?: number | string;
    value?: string;
}

export const CreateRoadmapLinkItem = ({ verticalPadding, value }: CreateRoadmapLinkItemProps) => {
    const isDark = useThemeStore((state) => state.isDark);

    return (
        <MenuItem value={value} sx={{ padding: 0 }}>
            <Link
                href={PLANNER_LINK}
                target="_blank"
                sx={{
                    padding: 2,
                    paddingTop: verticalPadding,
                    paddingBottom: verticalPadding,
                    width: '100%',
                    height: '100%',
                    ...(isDark && { color: LIGHT_BLUE }),
                }}
            >
                Create a roadmap!
            </Link>
        </MenuItem>
    );
};
