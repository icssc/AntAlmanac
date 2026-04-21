import { colorForIndex, deriveQueryLabel, MAX_QUERIES, useGradeExplorerStore } from '$stores/GradeExplorerStore';
import { Add, Close } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useCallback } from 'react';

export function QueryStack() {
    const queries = useGradeExplorerStore((s) => s.queries);
    const activeQueryId = useGradeExplorerStore((s) => s.activeQueryId);
    const setActiveQuery = useGradeExplorerStore((s) => s.setActiveQuery);
    const removeQuery = useGradeExplorerStore((s) => s.removeQuery);
    const addQuery = useGradeExplorerStore((s) => s.addQuery);

    const handleAdd = useCallback(() => addQuery(), [addQuery]);

    return (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap rowGap={1}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 0.5 }}>
                Comparing:
            </Typography>
            {queries.map((query, index) => {
                const color = colorForIndex(index);
                const isActive = query.id === activeQueryId;
                return (
                    <Chip
                        key={query.id}
                        label={deriveQueryLabel(query)}
                        onClick={() => setActiveQuery(query.id)}
                        onDelete={queries.length > 1 ? () => removeQuery(query.id) : undefined}
                        deleteIcon={<Close fontSize="small" />}
                        variant={isActive ? 'filled' : 'outlined'}
                        sx={{
                            borderColor: color,
                            backgroundColor: isActive ? color : 'transparent',
                            color: isActive ? '#fff' : undefined,
                            fontWeight: isActive ? 600 : 400,
                            '& .MuiChip-deleteIcon': {
                                color: isActive ? 'rgba(255,255,255,0.85)' : undefined,
                            },
                            '&:hover': {
                                backgroundColor: isActive ? color : `${color}22`,
                            },
                        }}
                    />
                );
            })}
            {queries.length < MAX_QUERIES && (
                <Tooltip title="Compare another query">
                    <Box component="span">
                        <IconButton size="small" onClick={handleAdd} aria-label="Add comparison query">
                            <Add fontSize="small" />
                        </IconButton>
                    </Box>
                </Tooltip>
            )}
        </Stack>
    );
}
