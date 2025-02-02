import { Box } from '@mui/material';

import { useThemeStore } from '$stores/SettingsStore';

import './PrereqTree.css';

interface PrereqNodeProps {
    node: string;
    label: string;
    index?: number;
}

export function PrereqNode({ node, label }: PrereqNodeProps) {
    const { isDark } = useThemeStore();

    return (
        <Box className={node}>
            <div
                className={'course'}
                style={{
                    backgroundColor: isDark ? '#303030' : '#e0e0e0',
                    color: isDark ? '#bfbfbf' : 'black',
                }}
            >
                {label}
            </div>
        </Box>
    );
}
