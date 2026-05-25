import type { ReactNode } from 'react';

interface SectionTablePopoverSubheaderProps {
    subheader: ReactNode;
    predecessorLabel: string | null;
}

/** Shared CardHeader subheader for historical-data popovers (GPA, enrollment, syllabi). */
export function SectionTablePopoverSubheader({ subheader, predecessorLabel }: SectionTablePopoverSubheaderProps) {
    return (
        <>
            {subheader || (!predecessorLabel && <>&nbsp;</>)}
            {subheader && predecessorLabel && <br />}
            {predecessorLabel}
        </>
    );
}
