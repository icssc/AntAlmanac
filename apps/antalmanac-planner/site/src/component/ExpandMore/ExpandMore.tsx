import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton, IconButtonProps, styled } from '@mui/material';

interface ExpandMoreProps extends IconButtonProps {
    expanded: boolean;
}

// `expand` must be passed for this component to be updated properly
// oxlint-disable-next-line no-unused-vars
export const ExpandMore = styled(({ expanded, children, ...props }: ExpandMoreProps) => (
    <IconButton {...props}>{children ?? <ExpandMoreIcon />}</IconButton>
))(({ theme }) => ({
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
    variants: [
        {
            props: ({ expanded }) => !expanded,
            style: { transform: 'rotate(0deg)' },
        },
        {
            props: ({ expanded }) => !!expanded,
            style: { transform: 'rotate(180deg)' },
        },
    ],
}));
