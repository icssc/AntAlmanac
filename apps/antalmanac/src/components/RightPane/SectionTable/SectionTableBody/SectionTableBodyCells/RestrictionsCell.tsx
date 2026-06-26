import { EXCLUDE_RESTRICTION_CODES_OPTIONS } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/constants';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { Box, Link, Popover, Tooltip, Typography } from '@mui/material';
import type { AASection } from '@packages/antalmanac-types';
import { Fragment, useCallback, useMemo, useState } from 'react';

interface RestrictionsCellProps {
    section: AASection;
}

const RESTRICTION_CODE_LABELS = Object.fromEntries(
    EXCLUDE_RESTRICTION_CODES_OPTIONS.map(({ value, label }) => [value, label])
);

export const RestrictionsCell = ({ section }: RestrictionsCellProps) => {
    const { restrictions } = section;
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const parsedRestrictions = useMemo(
        () =>
            restrictions.split(' ').map((code, index) => {
                if (code !== 'and' && code !== 'or') {
                    return (
                        <Fragment key={index}>
                            {RESTRICTION_CODE_LABELS[code]}
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
            <Link
                href="https://www.reg.uci.edu/enrollment/restrict_codes.html"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    display: 'block',
                    marginTop: 1,
                }}
            >
                University Requirements
            </Link>
        </Box>
    );

    return (
        <TableBodyCellContainer>
            <Box>
                {/* Mobile: click to open popover */}
                <Box sx={{ display: { default: 'block', sm: 'none' } }}>
                    <Typography
                        component="button"
                        type="button"
                        variant="inherit"
                        onClick={(e) => {
                            setAnchorEl((cur) => (cur ? null : e.currentTarget));
                        }}
                        sx={{
                            background: 'none',
                            border: 0,
                            textDecoration: 'underline',
                            color: (theme) => theme.vars.palette.secondary.main,
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
                </Box>

                {/* Desktop: hover tooltip + link */}
                <Box sx={{ display: { default: 'none', sm: 'block' } }}>
                    <Tooltip title={restrictionDescriptions}>
                        <Link
                            href="https://www.reg.uci.edu/enrollment/restrict_codes.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: 'inherit', font: 'inherit' }}
                        >
                            {restrictions}
                        </Link>
                    </Tooltip>
                </Box>
            </Box>
        </TableBodyCellContainer>
    );
};
