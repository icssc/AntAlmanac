import { PLANNER_LINK } from '$src/globals';
import { Link, MenuItem } from '@mui/material';
import NextLink from 'next/link';

interface CreateRoadmapLinkItemProps {
    verticalPadding?: number | string;
    value?: string;
}

export const CreateRoadmapLinkItem = ({ verticalPadding, value }: CreateRoadmapLinkItemProps) => {
    return (
        <MenuItem value={value} sx={{ padding: 0 }}>
            <Link
                component={NextLink}
                href={PLANNER_LINK}
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
