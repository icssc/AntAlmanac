import { useQuickSearch } from "$src/hooks/useQuickSearch";
import { Search } from "@mui/icons-material";
import { Button } from "@mui/material";
import { AACourse } from "@packages/antalmanac-types";
import { useCallback } from "react";

/**
 * Routes the user to the corresponding search result
 */
export function CourseInfoSearchButton({
    courseDetails,
    term,
}: {
    courseDetails: AACourse;
    term: string;
}) {
    const quickSearch = useQuickSearch();

    const { deptCode, courseNumber } = courseDetails;

    const handleClick = useCallback(() => {
        quickSearch(deptCode, courseNumber, term);
    }, [courseNumber, deptCode, quickSearch, term]);

    return (
        <Button
            variant="contained"
            size="small"
            color="primary"
            style={{ minWidth: "fit-content" }}
            onClick={handleClick}
        >
            <Search />
        </Button>
    );
}
