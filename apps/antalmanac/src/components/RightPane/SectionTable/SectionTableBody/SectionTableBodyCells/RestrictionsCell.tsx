import { Box, Popover, Tooltip, Typography } from '@mui/material';
import { Fragment, useCallback, useMemo, useState } from 'react';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import restrictionsMapping from '$components/RightPane/SectionTable/static/restrictionsMapping.json';
import { useIsMobile } from '$hooks/useIsMobile';

interface RestrictionsCellProps {
    restrictions: string;
}

export const RestrictionsCell = ({ restrictions }: RestrictionsCellProps) => {
    const isMobile = useIsMobile();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const parsedRestrictions = useMemo(
        () =>
            restrictions.split(' ').map((code, index) => {
                if (code !== 'and' && code !== 'or') {
                    return (
                        <Fragment key={index}>
                            {restrictionsMapping[code as keyof typeof restrictionsMapping]}
                            <br />
                        </Fragment>
                    );
                }
                return null;
            }),
        [restrictions]
    );

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const restrictionDescriptions = <Typography>{parsedRestrictions}</Typography>;

    const restrictionContent = (
        <Box
            sx={{
                display: 'block',
                padding: 1,
            }}
        >
            <Typography>{parsedRestrictions}</Typography>
            <Typography
                component="a"
                href="https://www.reg.uci.edu/enrollment/restrict_codes.html"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    display: 'block',
                    marginTop: 1,
                }}
            >
                University Requirements
            </Typography>
        </Box>
    );

    return (
        <TableBodyCellContainer>
            <Box>
                {isMobile ? (
                    <>
                        <Typography
                            component="button"
                            type="button"
                            onClick={(e) => {
                                setAnchorEl((cur) => (cur ? null : e.currentTarget));
                            }}
                            sx={{
                                background: 'none',
                                border: 0,
                                textDecoration: 'underline',
                            }}
                        >
                            {restrictions}
                        </Typography>

                        <Popover
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorEl={anchorEl}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        >
                            {restrictionContent}
                        </Popover>
                    </>
                ) : (
                    <Tooltip title={restrictionDescriptions}>
                        <Typography
                            component="a"
                            href="https://www.reg.uci.edu/enrollment/restrict_codes.html"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {restrictions}
                        </Typography>
                    </Tooltip>
                )}
            </Box>
        </TableBodyCellContainer>
    );
};
