export type StepStatus = 'pending' | 'running' | 'done' | 'failed';

export interface SetupStep {
    label: string;
    /** Returns a short summary when the step succeeds. */
    run: () => Promise<string>;
    /** Lets the user fix a failed step by typing a value. The step runs again after `onSubmit`. */
    prompt?: {
        message: string;
        onSubmit: (value: string) => void;
    };
}
