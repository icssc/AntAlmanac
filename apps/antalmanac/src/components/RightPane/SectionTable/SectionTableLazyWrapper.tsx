import { SectionTableProps } from "$components/RightPane/SectionTable/SectionTable.types";
import { Suspense, lazy } from "react";

// This should be in SectionTable.tsx, IMO
const SectionTable = lazy(() => import("./SectionTable"));

export default function SectionTableLazyWrapper(props: SectionTableProps) {
    return (
        <Suspense fallback={<div></div>}>
            <SectionTable {...props} />
        </Suspense>
    );
}
