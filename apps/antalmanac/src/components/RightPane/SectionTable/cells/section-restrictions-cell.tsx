import { Box, Tooltip, Typography } from '@mui/material';
import { Fragment } from 'react';

import restrictionsMapping from '../static/restrictionsMapping.json';

import { SectionTableCell } from '$components/RightPane/SectionTable/cells/section-table-cell';

interface SectionRestrictionsCellProps {
    restrictions: string;
}

export function SectionRestrictionsCell(props: SectionRestrictionsCellProps) {
    const { restrictions } = props;

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
        <SectionTableCell>
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
        </SectionTableCell>
    );
}
