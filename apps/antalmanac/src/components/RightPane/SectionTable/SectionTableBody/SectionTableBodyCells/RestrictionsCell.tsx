import { Box, Tooltip, Typography } from '@mui/material';
import { Fragment } from 'react';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import restrictionsMapping from '$components/RightPane/SectionTable/static/restrictionsMapping.json';

interface RestrictionsCellProps {
    restrictions: string;
}

export const RestrictionsCell = ({ restrictions }: RestrictionsCellProps) => {
    const parseRestrictions = (restrictionCode: string) => {
        return restrictionCode.split(' ').map((code, index) => {
            if (code !== 'and' && code !== 'or') {
                return (
                    <Fragment key={index}>
                        {restrictionsMapping[code as keyof typeof restrictionsMapping]}
                        <br />
                    </Fragment>
                );
            }
            return null;
        });
    };

    return (
        <TableBodyCellContainer>
            <Box>
                <Tooltip title={<Typography>{parseRestrictions(restrictions)}</Typography>}>
                    <Typography>
                        <a
                            href="https://www.reg.uci.edu/enrollment/restrict_codes.html"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {restrictions}
                        </a>
                    </Typography>
                </Tooltip>
            </Box>
        </TableBodyCellContainer>
    );
};
