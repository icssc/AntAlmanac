import { PLANNER_LINK } from '$src/globals';
import { Link, MenuItem } from '@mui/material';

interface CreateRoadmapLinkItemProps {
    verticalPadding?: number | string;
}

export const CreateRoadmapLinkItem = ({ verticalPadding }: CreateRoadmapLinkItemProps) => {
    return (
        <MenuItem sx={{ padding: 0 }}>
            <Link
                href={PLANNER_LINK}
                target="_blank"
                sx={{
                    padding: 2,
                    paddingTop: verticalPadding,
                    paddingBottom: verticalPadding,
                    width: '100%',
                    height: '100%',
                }}
            >
                Create a roadmap!
            </Link>
        </MenuItem>
    );
};
