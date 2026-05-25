import type { ReactNode } from 'react';

interface PopoverSubheaderProps {
    subheader: ReactNode;
    predecessorLabel: string | null;
}

/** Shared CardHeader subheader for historical-data popovers (GPA, enrollment, syllabi). */
export function PopoverSubheader({ subheader, predecessorLabel }: PopoverSubheaderProps) {
    return (
        <>
            {subheader || (!predecessorLabel && <>&nbsp;</>)}
            {subheader && predecessorLabel && <br />}
            {predecessorLabel}
        </>
    );
}
