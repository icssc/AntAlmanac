import { SxProps, TableCell, TableCellProps } from '@mui/material';

interface TableBodyCellContainerProps extends TableCellProps {
    sx?: SxProps;
    children: React.ReactNode;
}

export function TableBodyCellContainer({ sx, children, ...rest }: TableBodyCellContainerProps) {
    return (
        <TableCell sx={{ padding: 0, ...sx }} {...rest}>
            {children}
        </TableCell>
    );
}
