import { Select } from '@inkjs/ui';

const OPTIONS = [
    { label: 'Try again', value: 'retry' },
    { label: 'Skip for now', value: 'skip' },
    { label: 'Quit', value: 'quit' },
];

interface SkipPromptProps {
    onRetry: () => void;
    onSkip: () => void;
    onQuit: () => void;
}

export function SkipPrompt({ onRetry, onSkip, onQuit }: SkipPromptProps) {
    function handleChange(value: string) {
        if (value === 'retry') {
            onRetry();
        } else if (value === 'skip') {
            onSkip();
        } else {
            onQuit();
        }
    }

    return <Select options={OPTIONS} onChange={handleChange} />;
}
