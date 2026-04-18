import { SxProps, TableCell, TableCellProps, Theme } from '@mui/material';

interface TableBodyCellContainerProps extends TableCellProps {
    sx?: SxProps<Theme>;
    children: React.ReactNode;
}

export function TableBodyCellContainer({ sx, children, ...rest }: TableBodyCellContainerProps) {
    return (
        <TableCell
            sx={{
                padding: 0,
                paddingRight: 0.5,
                wordBreak: 'break-word',
                ...sx,
            }}
            {...rest}
        >
            {children}
        </TableCell>
    );
}
