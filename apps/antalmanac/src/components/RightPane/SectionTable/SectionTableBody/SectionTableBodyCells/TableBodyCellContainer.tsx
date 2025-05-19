import { SxProps, TableCell } from '@mui/material';

interface TableBodyCellContainerProps {
    sx?: SxProps;
    children: React.ReactNode;
}

export function TableBodyCellContainer({ sx, children }: TableBodyCellContainerProps) {
    return <TableCell sx={{ padding: 0, ...sx }}>{children}</TableCell>;
}
