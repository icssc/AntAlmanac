interface SectionTablePopoverSubheaderProps {
    subheader: string | null;
    predecessorLabel?: string | null;
}

export function SectionTablePopoverSubheader({ subheader, predecessorLabel }: SectionTablePopoverSubheaderProps) {
    return (
        <>
            {subheader || (!predecessorLabel && <>&nbsp;</>)}
            {subheader && predecessorLabel && <br />}
            {predecessorLabel}
        </>
    );
}
