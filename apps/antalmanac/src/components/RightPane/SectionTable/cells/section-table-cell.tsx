import { TableCell as MuiTableCell } from '@material-ui/core';
import { forwardRef } from 'react';

export const SectionTableCell = forwardRef<HTMLTableCellElement, React.ComponentProps<typeof MuiTableCell>>(
    (props, ref) => <MuiTableCell {...props} ref={ref} style={{ padding: 0 }} />
);

SectionTableCell.displayName = 'TableCell';
