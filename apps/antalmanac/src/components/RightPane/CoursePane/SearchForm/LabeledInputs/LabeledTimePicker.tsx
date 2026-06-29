import type { TextFieldProps } from '@mui/material';
import type { TimePickerProps } from '@mui/x-date-pickers';
import dynamic from 'next/dynamic';

const LabeledTimePickerContent = dynamic(() => import('./LabeledTimePickerContent'), { ssr: false });

interface LabeledTimePickerProps {
    label: string;
    timePickerProps?: TimePickerProps;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
}

export const LabeledTimePicker = (props: LabeledTimePickerProps) => <LabeledTimePickerContent {...props} />;
