import { Skeleton } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import type { TimePickerProps } from '@mui/x-date-pickers';
import dynamic from 'next/dynamic';

const LabeledTimePickerContent = dynamic(() => import('./LabeledTimePickerContent'), {
    ssr: false,
    loading: () => <Skeleton variant="rounded" width="100%" height={40} sx={{ flex: 1 }} />,
});

interface LabeledTimePickerProps {
    label: string;
    timePickerProps?: TimePickerProps;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
}

export const LabeledTimePicker = (props: LabeledTimePickerProps) => <LabeledTimePickerContent {...props} />;
