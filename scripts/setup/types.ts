export type StepStatus = 'pending' | 'running' | 'done' | 'skipped' | 'failed';

export interface StepResult {
    status: 'done' | 'skipped';
    detail: string;
}

export interface SetupStep {
    label: string;
    /** Returns a short summary when the step succeeds. */
    run: () => Promise<string>;
    /** Lets the user fix a failed step by typing a value. The step runs again after `onSubmit`. */
    prompt?: {
        message: string;
        onSubmit: (value: string) => void;
    };
    /** Lets the user skip the step when it fails. */
    skippable?: boolean;
    /** Skips this step too when the step before it is skipped. */
    needsPreviousStep?: boolean;
}
